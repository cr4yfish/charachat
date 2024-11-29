"use server";

import { tool } from 'ai';
import { z } from "zod";
import { getChat, updateChat, updateDynamicMemory } from '../db/chat';
import { generateImage } from './image';
import { Chat, Profile } from '@/types/db';
import { author, authorNoStream } from './author';
import { getCurrentUser } from '../db/auth';
import { decryptMessage } from '@/lib/crypto';
import { getKeyServerSide } from '../serverHelpers';

// server side tool
type AddNewMemoryProps = {
    chat: Chat
}

export const addNewMemory = (props: AddNewMemoryProps) => tool({
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



export const removeMemory = (props: AddNewMemoryProps) => tool({
    description: "Remove something from the character's memory.",
    parameters: z.object({ forgetThis: z.string() }),
    execute: async ({ forgetThis } : { forgetThis: string }) => {
        try {
            const profile = await getCurrentUser();
            const memory = (await getChat(props.chat.id)).dynamic_book
            const newMemoryStream = await authorNoStream({
                profile,
                systemText: "You selectively remove a piece of information from a given text. You then return the resulting text only.",
                prompt: `
                    Remove the following: ${forgetThis}.
                    From this text: ${memory}
                `
            })
            console.log("got author stream", forgetThis, memory);
            const newMemory = newMemoryStream.text
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


type GenerateImageToolProps = {
    chat: Chat
}

// server side tool
export const generateImageTool = (props: GenerateImageToolProps) => tool({
    description: "Text to Image Tool",
    parameters: z.object({ text: z.string().describe("Prompt to generate the image.") }),
    execute: async ({ text }: { text: string }) => {
        try {

            let hfApiKey = undefined;
            let replicateApiKey = undefined;

            if(!hfApiKey && !replicateApiKey) {
                throw new Error("Neither Huggingface nor Replicate API keys are available. Please add them to your profile to use this tool.")
            }

            const key = await getKeyServerSide();

            try {
                if(hfApiKey) {
                    hfApiKey = decryptMessage(hfApiKey, Buffer.from(key, 'hex'));  
                }
                if(replicateApiKey) {
                    replicateApiKey = decryptMessage(replicateApiKey, Buffer.from(key, 'hex'));
                }
            } catch (e) {
                console.error(e);
                const err = e as Error;
                throw new Error("Error decrypting API keys: " + err.message);
            }
            
            if(!hfApiKey && !replicateApiKey) {
                throw new Error("Neither Huggingface nor Replicate API keys are available. Please add them to your profile to use this tool.")
            }

            const link = await generateImage({
                inputs: text,
                hfToken: hfApiKey,
                replicateToken: replicateApiKey,
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


// servere side tool

type SummarizeToolProps = {
    profile: Profile
}

export const summarizeTool = (props: SummarizeToolProps) => tool({
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


type ChatRenameToolProps = {
    chat: Chat
}

export const chatRenameTool = (props: ChatRenameToolProps) => tool({
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


type GetMemoryToolProps = {
    chat: Chat;
}

export const getMemory = (props: GetMemoryToolProps) => tool({
    description: "Retrieve the Memory to get chat context in order to respond well to a prompt.",
    parameters: z.object({ }),
    execute: async() => {
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


export const addToolResultToChat = () => tool({
    description: "Add the result of a tool invocation to the Chat",
    parameters: z.object({ result: z.string().describe("The tool result") }),
})
