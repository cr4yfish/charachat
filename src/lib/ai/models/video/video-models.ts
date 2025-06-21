import { VideoModel } from "../../types"

export const videoModels: VideoModel[] = [
    {
        id: "fal-ai/ltx-video/image-to-video",
        title: "LTX image to video",
        provider: "fal",
        type: "image-to-video"
    },
    {
        id: "fofr/ltx-video:983ec70a06fd872ef4c29bb6b728556fc2454125a5b2c68ab51eb8a2a9eaa46a",
        title: "LTX video",
        provider: "replicate",
        type: "text-to-video"
    }
]