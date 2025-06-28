import { ProviderId } from "../providers";


export type VideoModelId = 
    "fofr/ltx-video:983ec70a06fd872ef4c29bb6b728556fc2454125a5b2c68ab51eb8a2a9eaa46a" |
    "fal-ai/ltx-video/image-to-video"


export type VideoModel = {
    id: VideoModelId;
    title: string;
    provider: ProviderId;
    extra_lora?: string;
}

export const videoModels: VideoModel[] = [
    {
        id: "fofr/ltx-video:983ec70a06fd872ef4c29bb6b728556fc2454125a5b2c68ab51eb8a2a9eaa46a",
        title: "LTX video",
        provider: "Replicate",
    }
]