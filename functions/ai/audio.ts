"use server";

import Replicate from "replicate";

interface GenerateAudioProps {
    replicateToken: string;
    text: string;
    prefix?: string;
    speaker: string;
    language: string;
}

export type AudioResult = string;

export async function generateAudio(props: GenerateAudioProps): Promise<string> {
    const replicate = new Replicate({
        auth: props.replicateToken
    });
    const result = await replicate.run(
        "lucataco/xtts-v2:684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e", 
        { 
            input: {
                text: (props.prefix ? props.prefix : "") + props.text,
                speaker: props.speaker,
                language: props.language
            } 
        }
    );
    const audioResult: AudioResult = result as unknown as AudioResult;

    return audioResult;
}