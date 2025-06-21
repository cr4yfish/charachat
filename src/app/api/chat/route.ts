
import { getLLMModelCookie } from "@/app/actions";
import { getLanguageModel } from "@/lib/ai";
import { generateImageAgent } from "@/lib/ai/agents/image";
import { RAGMemory } from "@/lib/ai/browser-rag/rag";
import { _INTRO_MESSAGE, getDynamicBookPrompt, getSystemPrompt } from "@/lib/ai/prompts";
import { ModelId } from "@/lib/ai/types";
import { llmSupportsTools } from "@/lib/ai/utils";
import { getKeyServerSide } from "@/lib/crypto/server";
import { getCharacter } from "@/lib/db/character";
import { createChat, getChat } from "@/lib/db/chat";
import { addMessage, addMessages } from "@/lib/db/messages";
import { ERROR_MESSAGES } from "@/lib/errorMessages";
import { getMostRecentUserMessage, sanitizeResponseMessages } from "@/lib/utils";
import { Chat, Message } from "@/types/db";
import { currentUser } from "@clerk/nextjs/server";
import { CoreAssistantMessage, CoreToolMessage, createDataStreamResponse, Message as AIMessage, streamText, convertToCoreMessages } from "ai";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export const maxDuration = 30;

export async function GET(req:Request) {
    // id param
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
        console.error("Chat ID is required but not provided.");
        return new Response(ERROR_MESSAGES.CHAT_ID_REQUIRED, { status: 400 });
    }

    const res = await getChat(id);
    if (!res) {
        console.error("Chat not found for ID:", id);
        return new Response(ERROR_MESSAGES.CHAT_NOT_FOUND, { status: 404 });
    }

    return Response.json(res);
}

export async function POST(req:Request) {
    const { messages, chatId, isIntro, modelId: modelIdFromClient, characterId, isUserMessage, memories }: 
    { 
        messages: AIMessage[], chatId: string, isIntro?: boolean, 
        modelId: string, characterId?: string, isUserMessage: boolean, memories?: RAGMemory[]
    } = await req.json();

    /**
     * Access Controls and init stuff
     */
        if(!chatId) { return new Response(ERROR_MESSAGES.CHAT_ID_REQUIRED, { status: 400 }); }

        const user = await currentUser();
        if (!user) { return new Response(ERROR_MESSAGES.UNAUTHORIZED, { status: 401 });  }


        const clientLLM = (await getLLMModelCookie()) || modelIdFromClient;

        const userMessage = getMostRecentUserMessage(messages);
        if(!userMessage) {  return new Response(ERROR_MESSAGES.USER_MESSAGE_NOT_FOUND, { status: 400 });  }

    /**
     * End access controls and init stuff
     */

    let chat = await getChat(chatId);

    if(!chat) {
        try {
            
            if (!clientLLM) {  return new Response(ERROR_MESSAGES.LLM_MODEL_REQUIRED, { status: 400 }); }
            
            if(!characterId) {
                // we need this on setup
                return new Response(ERROR_MESSAGES.CHARACTER_ID_REQUIRED, { status: 400 });
            }

            chat = await createChat({
                chatId: chatId,
                title: "New Chat",
                description: "A chat with the AI character",
                userId: user.id,
                characterId: characterId,
                llm: clientLLM as ModelId,
            })

        } catch (error) {
            console.error("Error creating chat:", error);
            return new Response(ERROR_MESSAGES.CHAT_CREATION_FAILED, { status: 500 });
        }
    }


    const character = await getCharacter(chat.character.id);
    if (!character) { return new Response(ERROR_MESSAGES.CHARACTER_NOT_FOUND, { status: 404 }); }

    const key = await getKeyServerSide();

    // save user message
    // but only if it's NOT the intro message
    if(!isIntro && isUserMessage) {
        try {
            await addMessage({
                id: userMessage.id,
                created_at: userMessage.createdAt?.toString() || new Date().toISOString(),
                from_ai: false,
                content: userMessage.content,
                chat: { id: chatId } as Chat,
                clerk_user_id: user.id,
                character: character,
            }, key);
        } catch (error) {
            console.error("Error adding user message:", error);
            return new Response(ERROR_MESSAGES.CHAT_UPDATE_FAILED, { status: 500 });
        }
    } else if(isIntro) {
        // modify the last user message to be the intro message
        const introMessageContent = _INTRO_MESSAGE(character, user.username || "User");

        messages.splice(messages.length - 1, 1, {
            ...userMessage,
            content: introMessageContent,
        })
    }

    const modelId = (chat.llm || clientLLM) as ModelId;

    const model = await getLanguageModel({
        modelId: modelId,
    });


    const systemPrompt = getSystemPrompt({
        character, chat
    });

    const bookPrompt = getDynamicBookPrompt(memories);

    // Core messages strip them down to the essentials
    // -> saves tokens
    const coreMessages = convertToCoreMessages(messages);

    // make sure the first message is a user message
    // some models will add an empty user message at the start
    // if the first message is not a user message,
    // but they make message.content empty,
    // which will break the AI response
    // idiots
    coreMessages.unshift({
        role: "user",
        content: "[ignore this message]",
    });

    return createDataStreamResponse({
        execute: (dataStream) => {
            dataStream.writeData({
                type: "user-message-id",
                content: userMessage.id,
            });

            const result = streamText({
                toolCallStreaming: true,
                maxSteps: 3,
                model: model,
                messages: [
                    {
                        // System prompt for the AI character
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        // Dynamic book prompt for the AI character
                        role: "system",
                        content: bookPrompt
                    },
                    // User & AI messages
                    ...coreMessages
                ],
                onFinish: async ({ response }) => {

                    const responseMessagesWithoutIncompleteToolCalls = sanitizeResponseMessages(response.messages);

                    // only save assistant messages and tool results
                    const assistantMessages = responseMessagesWithoutIncompleteToolCalls.filter(
                    (message) => (message.role === "assistant" || message.role === "tool"),
                    );

                    if (assistantMessages.length === 0) {
                        console.warn("No assistant messages to save.");
                        return;
                    }

                    try {
                        await addMessages({
                            messages: assistantMessages.map(
                                (message: CoreAssistantMessage | CoreToolMessage) => {

                                    const messageId = uuidv4();
                                    
                                    // send the real messageId to the data stream
                                    // so we can access it in the frontend
                                    // (the SDK generates a placeholder id for the message beforehand)
                                    if (message.role === 'assistant') {
                                        dataStream.writeMessageAnnotation({
                                            messageIdFromServer: messageId,
                                            messageModelId: modelId
                                        });
                                    }

                                    return {
                                        id: messageId,
                                        created_at: new Date().toISOString(),
                                        from_ai: true,
                                        content: JSON.stringify(message.content),
                                        chat: { id: chatId } as Chat,
                                        character: character,
                                    } as Message
                                },
                            ),
                            key,
                            userId: user.id,
                        });
                    } catch (error) {
                        console.error("Error saving assistant messages:", error);
                    }

                },
                onError: (error) => {
                    console.error("Error in AI response:", JSON.stringify(error, null, 2));
                },
                tools: !llmSupportsTools(modelId) ? undefined : {
                    imageGen: {
                        description: "Generate an image based on the provided prompt.",
                        parameters: z.object({
                            prompt: z.string().describe("The prompt for the image generation."),
                        }),
                        execute: async ({ prompt }) => {
                            try {
                                const imageLink = await generateImageAgent({ imagePrompt: prompt });
                                return imageLink
                            } catch (error) {
                                console.error("Error generating image:", error);
                                throw new Error("Image generation failed");
                            }
                        }
                    }
                }
            })
            
            result.mergeIntoDataStream(dataStream, {
                sendReasoning: false,
            });
        },
        onError(error) {
            console.error("Error in chat route:", error);
            return JSON.stringify(error, null, 2);
        },
    })
}