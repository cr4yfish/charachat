"use server";

import { getChat, updateChat, updateDynamicMemory } from '../db/chat';
import { Chat, Profile } from '@/types/db';
import { authorNoStream } from './author';
import { getCurrentUser } from '../db/auth';
import { getKeyServerSide } from '../serverHelpers';
import { checkIsEncrypted, decryptMessage } from '@/lib/crypto';
import { generateImage, generateImageOfCharacter } from './image';
import { generateAudio } from './audio';

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
        const newMemory = newMemoryStream.text

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
        return dynamicBook;
    } catch(error) {
        console.error(error);
        const err = error as Error;
        return err.message;
    }
}

type GenerateImageToolProps = {
    chat: Chat,
    profile: Profile,
    prompt: string,
}

// server side tool
export const generateImageTool = async (props: GenerateImageToolProps) => {
    try {
        let hfApiKey = props.profile.hf_encrypted_api_key;
        let replicateApiKey = props.profile.replicate_encrypted_api_key;

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

export const generateImageOfCharacterTool = async (props: GenerateImageToolProps) => {
    try {
        let replicateApiKey = props.profile.replicate_encrypted_api_key;

        if(!replicateApiKey) {
            throw Error("Replicate API keys are not available. Please add them to your profile to use this tool.")
        }

        replicateApiKey = decryptMessage(replicateApiKey, Buffer.from(await getKeyServerSide(), 'hex'));

        return await generateImageOfCharacter({
            inputs: props.prompt,
            replicateToken: replicateApiKey,
            prefix: props.chat.character.image_prompt || "",
            character: props.chat.character
        })
        
    } catch (error) {
        // happens a lot when ID doesnt work on the image
        // fallback to normal image
        console.error("generateImageOfCharacter error. Fallback to normal. Error:",error);
        return generateImageTool(props);
    }
}

type GenerateAudioToolProps = {
    chat: Chat,
    profile: Profile,
    prompt: string,
}

export const generateAudioTool = async (props: GenerateAudioToolProps): Promise<{ link?: string; error?: string; }> => {
    try {
        let replicateApiKey = props.profile.replicate_encrypted_api_key;
        if(!replicateApiKey) {
            return { error: "Replicate API key is not available. Please add it to your profile to use this tool." };
        }

        const keyBuffer = Buffer.from(await getKeyServerSide(), 'hex');

        if(!keyBuffer) {
            return { error: "Failed to get key from server" };
        }

        replicateApiKey = decryptMessage(replicateApiKey, keyBuffer);

        if(checkIsEncrypted(replicateApiKey)) {
            return { error: "Failed to decrypt API key" };
        }

        const defaultSpeaker = "https://replicate.delivery/pbxt/JqzxMWScZ4O44XwIwWveDoeAE2Ga7gYdnXKb8l18Fv7D3QEx/female.wav"

        const link = await generateAudio({
            text: props.prompt,
            language: "en",
            speaker: props.chat.character.speaker_link || defaultSpeaker,
            replicateToken: replicateApiKey
        })

        if(!link) {
            return { error: "Failed to generate audio. Got no link" }
        }

        if(!(typeof link === "string")) {
            return { error: `Return object is not a string: ${JSON.stringify(link)}` }
        }
            

        return { link }

    } catch (error) {
        console.error(error);
        const err = error as Error;
        return { error: err.message, link: undefined };
    }
}


// servere side tool

type SummarizeToolProps = {
    profile: Profile,
    text: string,
}

/**
 * Summarizes text over 1000 characters with the Author AI. Returns the summarized text, or original text if (too short | error)
 * @param props 
 * @returns 
 */
export const summarizeTool = async (props: SummarizeToolProps) => {
    try {

        // don't summarize short texts
        if(props.text.length < 1000) {
            return props.text;
        }

        const summarizedText = await authorNoStream({
            profile: props.profile,
            systemText: "You are a summarize tool for AI. You remove unnessesary words and shorten everything as much as possible. Your summary is always significantly shorter than the original text. The Resulting text does not need to be human readable. You only return the text.",
            prompt: "Summarize this text: " + props.text
        })

        return summarizedText.text;

    } catch (error) {
        console.error(error);
        return props.text;
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