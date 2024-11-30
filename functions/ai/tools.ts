"use server";

import { getChat, updateChat, updateDynamicMemory } from '../db/chat';
import { Chat, Profile } from '@/types/db';
import { authorNoStream } from './author';
import { getCurrentUser } from '../db/auth';
import { getKeyServerSide } from '../serverHelpers';
import { decryptMessage } from '@/lib/crypto';
import { generateImage } from './image';

type AddMemoryProps = {
    chat: Chat,
    memory: string,
}

export const addMemory = async (props: AddMemoryProps): Promise<string> => {
    return await updateDynamicMemory(props.chat.id, props.memory)
}

// server side tool
type RemoveMemoryProps = {
    chat: Chat,
    memory: string;
}

export const removeMemory = async (props: RemoveMemoryProps) => {
    try {
        const profile = await getCurrentUser();
        const memory = (await getChat(props.chat.id)).dynamic_book
        const newMemoryStream = await authorNoStream({
            profile,
            systemText: "You selectively remove a piece of information from a given text. You then return the resulting text only.",
            prompt: `
                Remove the following: ${props.memory}.
                From this text: ${memory}
            `
        })
        console.log("got author stream", props.memory, memory);
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

type GetMemoryToolProps = {
    chat: Chat;
}

export const getMemory = async (props: GetMemoryToolProps) => {
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

type GenerateImageToolProps = {
    chat: Chat,
    prompt: string,
}

// server side tool
export const generateImageTool = async (props: GenerateImageToolProps) => {
    try {
        let hfApiKey = undefined;
        let replicateApiKey = undefined;

        if(!hfApiKey && !replicateApiKey) {
            throw Error("Neither Huggingface nor Replicate API keys are available. Please add them to your profile to use this tool.")
        }

        const key = await getKeyServerSide();

        if(hfApiKey) {
            hfApiKey = decryptMessage(hfApiKey, Buffer.from(key, 'hex'));  
        }
        if(replicateApiKey) {
            replicateApiKey = decryptMessage(replicateApiKey, Buffer.from(key, 'hex'));
        }
        
        if(!hfApiKey && !replicateApiKey) {
            throw Error("Neither Huggingface nor Replicate API keys are available. Please add them to your profile to use this tool.")
        }

        const link = await generateImage({
            inputs: props.prompt,
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


// servere side tool

type SummarizeToolProps = {
    profile: Profile,
    text: string,
}

export const summarizeTool = async (props: SummarizeToolProps) => {
    try {
        const summarizedText = await authorNoStream({
            profile: props.profile,
            systemText: "You are a summarize tool for AI. You remove unnessesary words and shorten everything as much as possible. Your summary is always significantly shorter than the original text.",
            prompt: "Summarize this text: " + props.text
        })

        return summarizedText.text;

    } catch (error) {
        console.error(error);
        const err = error as Error;
        return err.message;
    }
    
}


type ChatRenameToolProps = {
    chat: Chat,
    newTitle: string,
    newDescription: string,
}

export const chatRenameTool = async (props: ChatRenameToolProps) => {
    try {
        await updateChat({
            ...props.chat,
            title: props.newTitle,
            description: props.newDescription
        })

        return "success"
    } catch(error) {
        console.error(error);
        const err = error as Error;
        return err.message;
    }
}

type BanStringsToolProps = {
    chat: Chat,
    strings: string[],
}

export const banStringsTool = async (props: BanStringsToolProps) => {
    try {

        await updateChat({
            ...props.chat,
            negative_prompt: (props.chat.negative_prompt ?? "") + "," + props.strings.join(",")
        })

        return `Banned ${props.strings.join(",")}`;

    } catch(error) {
        console.error(error);
        const err = error as Error;
        return err.message;
    }
}