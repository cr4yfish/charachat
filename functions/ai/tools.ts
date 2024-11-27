"use server";

import { tool } from 'ai';
import { z } from "zod";
import { getChat, updateChat, updateDynamicMemory } from '../db/chat';
import { generateImage } from './image';
import { Chat, Profile } from '@/types/db';
import { author } from './author';
import { getCurrentUser } from '../db/auth';

// server side tool
type AddNewMemoryProps = {
    chat: Chat
}

export const addNewMemory = (props: AddNewMemoryProps) => {
    return tool({
        description: "Add a new memory to the character's knowledge.",
        parameters: z.object({ memory: z.string() }),
        execute: async ({ memory }: { memory: string }) => {
            try {
                await updateDynamicMemory(
                    props.chat.id,
                    memory
                )
                
                return memory;
            } catch (error) {
                console.error(error);
                const err = error as Error;
                return err.message;
            }
        }
    })
}


export const removeMemory = (props: AddNewMemoryProps) => {
    return tool({
        description: "Remove something from the character's memory.",
        parameters: z.object({ forgetThis: z.string() }),
        execute: async ({ forgetThis } : { forgetThis: string }) => {
            try {
                const profile = await getCurrentUser();
                const memory = (await getChat(props.chat.id)).dynamic_book
                const newMemoryStream = await author({
                    profile,
                    noStream: true,
                    systemText: "You selectively remove a piece of information from a given text. You then return the resulting text only.",
                    prompt: `
                        Remove the following: ${forgetThis}.
                        From this text: ${memory}
                    `
                })
                console.log("got author stream", forgetThis, memory);
                const newMemory = await newMemoryStream.text
                console.log("new memory:", newMemory)

                await updateChat({
                    ...props.chat,
                    dynamic_book: newMemory
                })

                return newMemory;

            } catch(error) {
                console.error(error);
                const err = error as Error;
                return err.message;
            }
        }
    })
}

type GenerateImageToolProps = {
    chat: Chat,
    decryptedHfApiKey: string,
    decryptedReplicateApiKey: string
}

// server side tool
export const generateImageTool = (props: GenerateImageToolProps) => {
    return tool({
        description: "Text to Image Tool",
        parameters: z.object({ text: z.string().describe("Describe whats going on in the chat context") }),
        execute: async ({ text }: { text: string }) => {
            try {
                const link = await generateImage({
                    inputs: text,
                    hfToken: props.decryptedHfApiKey,
                    replicateToken: props.decryptedReplicateApiKey,
                    prefix: props.chat.character.image_prompt || ""
                })

                return link;

            } catch (error) {
                console.error(error);
                const err = error as Error;
                return err.message;
            }
        }
    })
}

// servere side tool

type SummarizeToolProps = {
    profile: Profile
}

export const summarizeTool = (props: SummarizeToolProps) => {
    return tool({
        description: "Summarize the conversation",
        parameters: z.object({ text: z.string().describe("A bunch of text to summarize") }),
        execute: async ({ text }: { text: string }) => {
            try {
                const summarizedText = await author({
                    profile: props.profile,
                    systemText: "You are a summarize tool",
                    prompt: "Summarize this text: " + text
                })

                return summarizedText

            } catch (error) {
                console.error(error);
                const err = error as Error;
                return err.message;
            }
        }
    })
}

type ChatRenameToolProps = {
    chat: Chat
}

export const chatRenameTool = (props: ChatRenameToolProps) => {
    return tool({
        description: "Rename the Chat when conversation theme changes",
        parameters: z.object({ newTitle: z.string().describe("New title of the chat"), newDescription: z.string().describe("New very short description of the title") }),
        execute: async({ newTitle, newDescription } : { newTitle: string, newDescription: string }) => {
            try {
                await updateChat({
                    ...props.chat,
                    title: newTitle,
                    description: newDescription
                })

                return "success"
            } catch(error) {
                console.error(error);
                const err = error as Error;
                return err.message;
            }
        }
    })
}

type GetMemoryToolProps = {
    chat: Chat;
}

export const getMemoryTool = (props: GetMemoryToolProps) => {
    return tool({
        description: "Retrieve the Memory to get chat context in order to response well to a prompt.",
        parameters: z.object({ }),
        execute: async({  } : { }) => {
            try {
                const dynamicBook = (await getChat(props.chat.id)).dynamic_book;
                console.log("get memory tool:", dynamicBook);
                return dynamicBook;
            } catch(error) {
                console.error(error);
                const err = error as Error;
                return err.message;
            }
        } 
    })
}

export const addToolResultToChat = () => {
    return tool({
        description: "Add the result of a tool invocation to the Chat",
        parameters: z.object({ result: z.string().describe("The tool result") }),
    })
}