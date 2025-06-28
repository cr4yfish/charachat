
import { Lora } from "../../../db/types";
import { ProviderId } from "../providers";


export type ImageModelId = 
    "black-forest-labs/FLUX.1-schnell" |
    "strangerzonehf/Flux-Midjourney-Mix2-LoRA" |
    "XLabs-AI/flux-RealismLora" |
    "xey/sldr_flux_nsfw_v2-studio" |
    "shuttleai/shuttle-3.1-aesthetic" |
    "Djrango/Qwen2vl-Flux" |
    "Shakker-Labs/AWPortraitCN" |
    "stabilityai/sdxl-turbo" |
    "luma/photon-flash" |
    "black-forest-labs/flux-schnell" |
    "nvidia/sana:c6b5d2b7459910fec94432e9e1203c3cdce92d6db20f714f1355747990b52fa6" |
    "black-forest-labs/flux-1.1-pro-ultra" |
    "black-forest-labs/flux-1.1-pro" |
    "stability-ai/stable-diffusion-3.5-large" |
    "stability-ai/stable-diffusion-3.5-large-turbo" |
    "datacte/proteus-v0.3:b28b79d725c8548b173b6a19ff9bffd16b9b80df5b18b8dc5cb9e1ee471bfa48" |
    "makinsongary698/jh:4423082b68f497cf91a93031872cb5c3f7d5f8a9de8fa32d4db94e17094049b9" |
    "datacte/flux-aesthetic-anime:2c3677b83922a0ac99493467805fb0259f55c4f4f7b1988b1dd1d92f083a8304" |
    "delta-lock/ponynai3:ea38949bfddea2db315b598620110edfa76ddaf6313a18e6cbc6a98f496a34e9" |
    "charlesmccarthy/pony-sdxl:b070dedae81324788c3c933a5d9e1270093dc74636214b9815dae044b4b3a58a" |
    "delta-lock/noobai-xl:dceca5ec09fd6fd0e5dbd5d3dcefb25f73802560e5b89008021fd07c9691e880" |
    "lucataco/flux-dev-lora:091495765fa5ef2725a175a57b276ec30dc9d39c22d30410f2ede68a3eab66b3" |
    "cjwbw/animagine-xl-3.1:6afe2e6b27dad2d6f480b59195c221884b6acc589ff4d05ff0e5fc058690fbb9" |
    "aisha-ai-official/animagine-xl-4.0:057e2276ac5dcd8d1575dc37b131f903df9c10c41aed53d47cd7d4f068c19fa5" |
    "aisha-ai-official/wai-nsfw-illustrious-v11:152992479714a33337898ed89d84dd2e74a6111834638d04135f4efc2cba94f2" |
    "google/imagen-3"

export type ImageModel = {
    id: ImageModelId;
    title: string;
    style: string;
    provider: ProviderId;
    extra_lora?: Lora[];
}

export const imageModels: ImageModel[] = [
    {
        id: "black-forest-labs/flux-schnell",
        title: "Flux Schnell",
        style: "Flux Fast",
        provider: "Replicate",
    },
    {
        id: "black-forest-labs/flux-1.1-pro",
        title: "Flux Pro",
        style: "Flux Pro",
        provider: "Replicate",
    },
    {
        id: "black-forest-labs/flux-1.1-pro-ultra",
        title: "Flux Pro Ultra",
        style: "Flux Ultra",
        provider: "Replicate",
    },
    {
        id: "google/imagen-3",
        title: "Imagen 3",
        style: "Imagen 3",
        provider: "Replicate",
    },
    {
        id: "cjwbw/animagine-xl-3.1:6afe2e6b27dad2d6f480b59195c221884b6acc589ff4d05ff0e5fc058690fbb9",
        title: "animagine xl 3.1",
        style: "Animagine3",
        provider: "Replicate",
    },
]
