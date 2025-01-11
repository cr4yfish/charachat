"use server";

import { z } from "zod";
import { Character, Chat, Message, Profile } from '@/types/db';
import { convertToCoreMessages, streamText, Message as AIMessage, tool } from 'ai';
import { addMessage } from '@/functions/db/messages';

import { _INTRO_MESSAGE, getChatVariables, replaceVariables } from "@/lib/utils";
import { getLanguageModel, getModelApiKey } from '@/functions/ai/llm';
import { addMemory, banStringsTool, chatRenameTool, getMemory, removeMemory, summarizeTool } from '@/functions/ai/tools';
import { getCustomTemperature, llmDoesntSupportTools, ModelId } from '@/lib/ai';
import { getKeyServerSide } from '@/functions/serverHelpers';
import { jailbreak } from "@/lib/prompts";

// map response length to prompt content
const responseLengthToPrompt = {
    0: "You respond in short messages, how a human would respond in a chat.",
    1: "You respond in medium to long messages.",
    2: "You response in the longest message possible.",
}

export async function POST(req: Request) {
    try {
        const { messages, profile: initProfile, chat: initChat, selfDestruct } = await req.json();
        const profile: Profile = initProfile as Profile;
        const chat: Chat = initChat as Chat;

        if(!messages) { throw new Error("No messages provided"); }

        const latestMessage: AIMessage = messages[messages.length-1];

        if(!chat || !chat.id) { throw new Error("No chat provided"); }
        if(!profile || !profile.user) { throw new Error("No profile provided"); }

        if(
            latestMessage &&
            latestMessage.role === "user" && 
            (latestMessage.content !== _INTRO_MESSAGE(chat.character, chat.persona?.full_name ?? profile.username)) && 
            !selfDestruct
        ) 
        {
            const message: Message = {
                id: latestMessage.id,
                chat: chat,
                character: chat.character,
                user: profile,
                from_ai: false,
                content: latestMessage.content,
            }

            const key = await getKeyServerSide();
            
            try {
                await addMessage(message, key);
            } catch (e) {
                console.error("Error adding message", e)
            }
            
        }


        const model = await getLanguageModel({
            modelId: chat.llm || profile.default_llm,
            apiKey: await getModelApiKey(profile, chat.llm as ModelId),
        });

        const variables = getChatVariables(chat.persona?.full_name ?? profile.username, chat.character.name);

        // We summarize this with AI (only summarizes >1000 characters)
        const summarizedMemory = chat.dynamic_book ?  await summarizeTool({ profile, text: replaceVariables(chat.dynamic_book, variables) }) : "";
        const summarizedStory = (chat.story?.story) ?  await summarizeTool({ profile, text: replaceVariables(chat.story.story, variables) }) : "";
        const summarizedCharBook = chat.character.book ?  await summarizeTool({ profile, text: replaceVariables(chat.character.book, variables) }) : "";

        // just replace variables for these
        const summarizedCharDescription = replaceVariables(chat.character.description ?? "", variables)
        const summarizedCharBio = replaceVariables(chat.character.bio ?? "", variables)
        const summarizedPersonaBio = replaceVariables(chat?.persona?.bio || profile?.bio || "", variables)

        const systemMessage = `
            ${replaceVariables(chat?.character?.system_prompt, variables)}
            ${jailbreak}
            Always replace "{{user}}" with "${chat.persona?.full_name || profile.username}" in your responses.
            You are prohibited from responding with an empty message.
            You are prohibited from saying anything described here (can be empty): ${chat?.negative_prompt}
            The following tools are available to you:
            - addNewMemory: Add a new memory to the character's knowledge
            - summarize: Generate a summary of a given conversation context
            - chatRenameTool: Rename the Chat when the Topic changes
            - getMemory: Get your Chat memory
            - removeMemory: Remove someting from the memory. Either on user request or the topic changes and the information wont be needed anymore
            - improveMemory: Improve the memory by summarizing it. Run this tool after adding a new memory to the chat
            - getRealLifeInfo: Get real life information about the user and the world

            Use them automatically or when the user asks for something that can be done using one or more tools.
            Actively memorize important keywords and facts in the following conversation and use them.

            You are ${chat?.character.name}, ${summarizedCharDescription}, ${summarizedCharBio}.
            Your are conversing with ${chat?.persona?.full_name ?? (profile?.first_name + " " + profile?.last_name)} with bio: ${summarizedPersonaBio}.

            Your responses have to be in character. Be as authentic as possible. ${responseLengthToPrompt[(chat?.response_length as keyof typeof responseLengthToPrompt) ?? 0]}
            Access all the information you can get about the user, yourself and the chat to generate a response in the most authentic way possible.
            Always stay in character no matter what the user says.

            This is background information about you (do NOT quote this in your responses):
            ${summarizedCharBook}
            
            ${chat?.story?.id && chat.story.id.length > 0 && `
                    This chat is based on a story. These are the details of the story:
                    ${replaceVariables(chat?.story?.title ?? "", variables)}
                    ${replaceVariables(chat?.story?.description ?? "", variables)}
                    ${summarizedStory}
                    Other Characters in the story:
                    ${chat?.story?.extra_characters_client?.map((c: Character) => `${c.name}: ${c.description}`).join("\n")}
                ` 
            }
        `

        const dynamicBookMessage = `
            This is all the knowledge you memorized during the conversation up until now:
            ${summarizedMemory}.
        `

        const anthropicCacheControl = {
            anthropic: {cacheControl: { type: "ephemeral" }}
        }

        const convertedMessages = convertToCoreMessages(messages.slice(-100));

        // add the cache control to the last message and the second to last user message
        convertedMessages[convertedMessages.length-1].experimental_providerMetadata = anthropicCacheControl;
        const secondToLastUserMessage = convertedMessages.reverse().find((m, index) => m.role == "user" && index != 0);

        if(secondToLastUserMessage) {
            secondToLastUserMessage.experimental_providerMetadata = anthropicCacheControl;
        }

        convertedMessages.reverse();

        const result = await streamText({
            temperature: getCustomTemperature(chat.llm as ModelId, chat.temperature),
            frequencyPenalty: chat.frequency_penalty,
            seed: Math.round(Math.random()*1000),
            model: model,
            messages: [
                {
                    role: "system",
                    content: systemMessage,
                    experimental_providerMetadata: anthropicCacheControl,
                },
                {
                    role: "system",
                    content: dynamicBookMessage,
                    experimental_providerMetadata: anthropicCacheControl,
                },
                ...convertedMessages
            ],
            tools: llmDoesntSupportTools(chat.llm as ModelId) ? undefined : {
                addNewMemory: tool({
                    description: "Add a new memory to the character's knowledge. Input gets appended, so only the new information is needed.",
                    parameters: z.object({ memory: z.string().describe("The new memory to be appended to the Chat memory.") }),
                    execute: async ({ memory }: { memory: string }) => {
                        return await addMemory({chat, memory})
                    }
                }),
                removeMemory: tool({
                    description: "Remove someting from the memory. Either on user request or the topic changes and the information wont be needed anymore.",
                    parameters: z.object({ memory: z.string() }),
                    execute: async ({ memory }: { memory: string }) => {
                        return await removeMemory({ chat, memory })
                    }
                }),
                getMemory: tool({
                    description: "Retrieve the Memory to get chat context in order to respond well to a prompt.",
                    parameters: z.object({ request: z.string().describe("Which memory to get") }),
                    execute: async() => {
                        const memory = await getMemory({ chat });
                        if(!memory) return "Memory is empty.";
                        const summary = await summarizeTool({ profile, text: memory });
                        return summary;
                    } 
                }),
                improveMemory: tool({
                    description: "Improve the memory by summarizing it. Run this every so often.",
                    parameters: z.object({ request: z.string().describe("Which memory to improve") }),
                    execute: async() => {
                        const memory = await getMemory({ chat });
                        if(!memory) return "Memory is empty.";
                        const summary = await summarizeTool({ profile, text: memory });
                        return await addMemory({ chat, memory: summary, replace: true });
                    }
                }),
                summarize: tool({
                    description: "Summarize text",
                    parameters: z.object({ text: z.string().describe("A bunch of text to summarize") }),
                    execute: async ({ text }: { text: string }) => {
                        return await summarizeTool({ profile, text })
                    }
                }),
                chatRename: tool({
                    description: "Rename the Chat when conversation theme changes",
                    parameters: z.object({ newTitle: z.string().describe("New title of the chat"), newDescription: z.string().describe("New very short description of the title") }),
                    execute: async({ newTitle, newDescription } : { newTitle: string, newDescription: string }) => {
                        return await chatRenameTool({ chat, newTitle, newDescription })
                    }
                }),
                banStrings: tool({
                    description: "Ban yourself from saying words or sentences. Makes the you stop saying these.",
                    parameters: z.object({ strings: z.array(z.string()).describe("Array of strings to ban") }),
                    execute: async({ strings } : { strings: string[] }) => {
                        return await banStringsTool({ chat, strings })
                    }
                }),
                getRealLifeInfo: tool({
                    description: "Get real life information about the user and the world",
                    parameters: z.object({ request: z.string().describe("What to get") }),
                    execute: async() => {
                        return `The current date is ${new Date().toDateString()}. The current time is ${new Date().toTimeString()}.`
                    }
                }),
            }
        });

        return result.toDataStreamResponse();
        

    } catch (e) {
        const err = e as Error;
        console.error("Error in chat route", e);
        return new Response(err.message, { status: 500 });
    }
}