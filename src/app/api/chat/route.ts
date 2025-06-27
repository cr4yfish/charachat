
import { getLLMModelCookie, getPersonaCookie } from "@/app/actions";
import { getLanguageModel, getModelApiKey } from "@/lib/ai";
import { generateImageAgent } from "@/lib/ai/agents/image";
import { RAGMemory } from "@/lib/ai/browser-rag/rag";
import { _INTRO_MESSAGE, getDynamicBookPrompt, getMemoriesPrompt, getSystemPrompt, noCharacterSelectedPrompt } from "@/lib/ai/prompts";
import { ModelId, ProviderIdEnum} from "@/lib/ai/types";
import { getLLMById, llmSupportsTools } from "@/lib/ai/utils";
import { getKeyServerSide } from "@/lib/crypto/server";
import { getCharacter } from "@/lib/db/character";
import { createChat, getChat } from "@/lib/db/chat";
import { addMessage, addMessages } from "@/lib/db/messages";
import { getPersona } from "@/lib/db/persona";
import { getProfile } from "@/lib/db/profile";
import { ERROR_MESSAGES } from "@/lib/constants/errorMessages";
import { getMostRecentUserMessage, sanitizeResponseMessages } from "@/lib/utils/message";
import { Character } from "@/lib/db/types/character";
import { Chat } from "@/lib/db/types/chat";
import { Persona } from "@/lib/db/types/persona";
import { currentUser } from "@clerk/nextjs/server";
import { CoreAssistantMessage, CoreToolMessage, createDataStreamResponse, Message as AIMessage, streamText, convertToCoreMessages } from "ai";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { Message } from "@/lib/db/types/message";
import searchCharactersWithAIAgent from "@/lib/ai/agents/search";

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
    const { 
        messages, chatId, isIntro, modelId: modelIdFromClient, 
        characterId, isUserMessage, memories, isSmallChat
    }: 
    { 
        messages: AIMessage[], chatId: string, isIntro?: boolean, 
        modelId: string, characterId?: string, isUserMessage: boolean, memories?: RAGMemory[],
        isSmallChat?: boolean
    } = await req.json();

    /**
     * Access Controls and init stuff
     */
    
        // Some kind of chatId is always required
        // even its a temporary chat
        if(!chatId) { return new Response(ERROR_MESSAGES.CHAT_ID_REQUIRED, { status: 400 }); }

        const user = await currentUser();
        if (!user) { return new Response(ERROR_MESSAGES.UNAUTHORIZED, { status: 401 });  }

        const userMessage = getMostRecentUserMessage(messages);
        if(!userMessage) {  return new Response(ERROR_MESSAGES.USER_MESSAGE_NOT_FOUND, { status: 400 });  }

    /**
     * End access controls and init stuff
     */

    const clientLLM = (await getLLMModelCookie()) || modelIdFromClient;
    let chat: Chat | undefined = await getChat(chatId);

    // only create chat if:
    // - chat does not exist
    // - characterId is provided
    // - isSmallChat is not true (small chat does not create a new chat)
    if(!chat && characterId && (isSmallChat !== true)) {
        try {
            
            if (!clientLLM) {  return new Response(ERROR_MESSAGES.LLM_MODEL_REQUIRED, { status: 400 }); }

            const personaId = await getPersonaCookie();

            chat = await createChat({
                chatId: chatId,
                title: "New Chat",
                description: "A chat with the AI character",
                userId: user.id,
                characterId: characterId,
                llm: clientLLM as ModelId,
                personaId: personaId
            })

        } catch (error) {
            console.error("Error creating chat:", error);
            return new Response(ERROR_MESSAGES.CHAT_CREATION_FAILED, { status: 500 });
        }
    }


    // try to get the character by either:
    // - chat.character.id (if chat exists)
    // - characterId (if provided)
    // character is optional, so it can be undefined
    const character: Character | undefined = chat ? await getCharacter(chat.character.id) : characterId ? await getCharacter(characterId) : undefined;


    let userPersona: Persona | undefined = undefined;
    
    // chat.persona is actually a string and not a Persona object
    if(chat?.persona) {
        userPersona = await getPersona((chat.persona as unknown as string));
    }

    if(!userPersona) {
        // fallback to cookie
        const personaId = await getPersonaCookie();
        if(personaId) userPersona = await getPersona(personaId);
    }

    const key = await getKeyServerSide();

    // save user message
    // but only if it's NOT the intro message
    // or if it's a small chat
    if(!isIntro && isUserMessage && chat?.id && (isSmallChat !== true)) {
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
    } 
    
    // Add the intro message if needed
    else if(isIntro && character) {
        // modify the last user message to be the intro message
        const introMessageContent = _INTRO_MESSAGE(character, user.username || "User");

        messages.splice(messages.length - 1, 1, {
            ...userMessage,
            content: introMessageContent,
        })
    }
    
    const profile = await getProfile(user.id);
    if (!profile) {
        console.error("Profile not found for user:", user.id);
        return new Response(ERROR_MESSAGES.PROFILE_NOT_FOUND, { status: 404 });
    }

    // we have various methods to get the modelId:
    // 1. chat.llm (if chat exists) <- User preference for this chat
    // 2. clientLLM (from the request body) <- Only used on new chats
    // 3. profile.default_llm (from the user's profile) <- Used for fallback
    const modelId = (chat?.llm || clientLLM || profile.default_llm) as ModelId;

    // Try to get the API key for the model
    // If it fails, return a 400 error with the error message
    let apiKey = undefined;
    try { apiKey = await getModelApiKey(profile, modelId) } 
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return new Response(errorMessage, { status: 400 });
    }

    const model = await getLanguageModel({  modelId: modelId, apiKey });
    const internalModel = getLLMById(modelId);


    const systemPrompt = getSystemPrompt({ character, chat, persona: userPersona });
    const bookPrompt = getDynamicBookPrompt(chat?.dynamic_book);
    const memoriesPrompt = getMemoriesPrompt(memories);

    // Core messages strip them down to the essentials
    // -> saves tokens
    const activeContextLength = 40;
    const coreMessages = convertToCoreMessages(messages).slice(-activeContextLength);
    const noCharPrompt = noCharacterSelectedPrompt(chat?.id === undefined);
    
    // make sure the first message is a user message
    // some models will add an empty user message at the start
    // if the first message is not a user message,
    // but they make message.content empty,
    // which will break the AI response
    // idiots
    if(coreMessages.length > 0 && coreMessages[0].role !== "user") {
        coreMessages.unshift({
            role: "user",
            content: "[ignore this message]",
        });
    }

    return createDataStreamResponse({
        execute: (dataStream) => {
            dataStream.writeData({
                type: "user-message-id",
                content: userMessage.id,
            });

            const result = streamText({
                providerOptions: {
                    groq: internalModel?.features?.includes("reasoning") ? { reasoningFormat: "parsed" } : {},
                    openai: {
                        reasoningSummary: "detailed"
                    }
                },
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
                        content: memoriesPrompt
                    },
                    {
                        // Dynamic book prompt for the AI character
                        role: "system",
                        content: bookPrompt
                    },
                    {
                        // No character selected prompt
                        // this is only used if the chat has no character
                        role: "system",
                        content: noCharPrompt
                    },
                    // User & AI messages
                    ...coreMessages
                ],
                onFinish: async ({ response }) => {

                    if(!chat?.id || isSmallChat) return;

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
                    },
                    searchCharacters: {
                        description: "Search for characters based on a query. Search is AI-powered and can perform complex queries.",
                        parameters: z.object({
                            query: z.string().describe("The query to search for characters. Can be natural language, tags, keywords, etc."),
                        }),
                        execute: async ({ query }) => {
                            if (!query) {
                                throw new Error("Query is required for character search.");
                            }
                            try {
                                const characters = await searchCharactersWithAIAgent({
                                    query, sort: "relevance", type: "characters"
                                });
                                return characters;
                            } catch (error) {
                                console.error("Error searching characters:", error);
                                throw new Error("Character search failed");
                            }
                        }
                    },

                    // client-side only
                    manageProviderTokens: {
                        description: "Manage a provider API token. This will display a custom UI in the chat.",
                        parameters: z.object({
                            providerQuestion: ProviderIdEnum.describe("The provider for which to manage tokens."),
                            provider: ProviderIdEnum.describe("The provider for which to manage tokens. This is used to display the correct UI."),
                        }),
                    }
                },
            })
            
            result.mergeIntoDataStream(dataStream, {
                sendReasoning: true,
            });
        },
        onError(error) {
            console.error("Error in chat route:", error);
            return JSON.stringify(error, null, 2);
        },
    })
}