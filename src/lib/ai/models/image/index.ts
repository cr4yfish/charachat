
import { Lora } from "../../../db/types";
import { ProviderId } from "../providers";


export type ImageModelId = 
/**
 * Replicate models
 */
    /**
     * Black Forest Labs models
     */
    "black-forest-labs/flux-schnell" |
    "black-forest-labs/flux-1.1-pro-ultra" |
    "black-forest-labs/flux-1.1-pro" |
    "black-forest-labs/flux-kontext-pro" |
    
    /**
     * Anime style stuff
     */
    "cjwbw/animagine-xl-3.1:6afe2e6b27dad2d6f480b59195c221884b6acc589ff4d05ff0e5fc058690fbb9" |
    "delta-lock/ponynai3:848da0d3e5a762b8662592acd1818003a3b4672f513d7250895bd0d96c6a48c9" |

    /**
     * Google models
     */
    "google/imagen-4" |
    "google/imagen-4-fast" |
    "google/imagen-4-ultra" |

    /**
     * Bytedance
     */
    "bytedance/seedream-3" |

    /**
     * Minimax
     */
    "minimax/image-01"

export type ImageFeature = "character_reference"

export type ImageModel = {
    id: ImageModelId;
    name: string;
    style?: string;
    provider: ProviderId;
    extra_lora?: Lora[];
    features?: ImageFeature[];
    image?: string; // URL to an image representing the model
}

export const imageModels: ImageModel[] = [
/**
 * Replicate models
 */
    /**
     * Black Forest Labs models
     */
    {
        id: "black-forest-labs/flux-schnell",
        name: "Flux Schnell",
        provider: "Replicate",
        image: "https://tjzk.replicate.delivery/models_models_featured_image/67c990ba-bb67-4355-822f-2bd8c42b2f0d/flux-schnell.webp"
    },
    {
        id: "black-forest-labs/flux-1.1-pro",
        name: "Flux Pro",
        provider: "Replicate",
        image: "https://tjzk.replicate.delivery/models_models_featured_image/bd872eff-363a-4e10-8cc1-84057afa9f57/flux-1.1-cover.webp"
    },
    {
        id: "black-forest-labs/flux-1.1-pro-ultra",
        name: "Flux Ultra",
        provider: "Replicate",
        image: "https://tjzk.replicate.delivery/models_models_featured_image/8121c76b-fbff-41d9-834d-c70dea9d2191/flux-ultra-cover.jpg"
    },
    {
        id: "black-forest-labs/flux-kontext-pro",
        name: "Flux Kontext",
        provider: "Replicate",
        features: ["character_reference"],
        image: "https://replicate.delivery/xezq/83OKs6yfdoT5YCpfREnrFFbqLbfWbus8Q0e06fQ0BAMDRKamC/tmpu3nqollf.jpg"
    },

    /**
     * Google
     */
    {
        id: "google/imagen-4",
        name: "Imagen",
        provider: "Replicate",
        image: "https://tjzk.replicate.delivery/models_models_featured_image/895ffdc5-07d6-4b16-ac62-b27ba5b24468/4ccgkq0a6xrm80cpykfszajfaw.webp"
    },
    {
        id: "google/imagen-4-fast",
        name: "Imagen Fast",
        provider: "Replicate",
        image: "https://tjzk.replicate.delivery/models_models_featured_image/73c5af65-f578-4113-b62c-2a56971cff2f/replicate-prediction-trmpwr78.webp"
    },
    {
        id: "google/imagen-4-ultra",
        name: "Imagen Ultra",
        provider: "Replicate",
        image: "https://replicate.delivery/xezq/eAsULzF8tzzXVSUtp7rvlDPqEkePBcLeTTWnqsSaCKYRtLspA/tmpikc6119g.jpg"
    },

    /**
     * Bytedance
     */
    {
        id: "bytedance/seedream-3",
        name: "Seedream",
        provider: "Replicate",
        image: "https://tjzk.replicate.delivery/models_models_featured_image/de2ae1dd-f7b8-4b9e-901e-86125ac2b4a8/tmpcoezojc2.jpg"
    },


    {
        id: "cjwbw/animagine-xl-3.1:6afe2e6b27dad2d6f480b59195c221884b6acc589ff4d05ff0e5fc058690fbb9",
        name: "Animagine",
        provider: "Replicate",
        image: "https://replicate.delivery/pbxt/eoW2VutuKlU6VCWExLyif2ETCw7eqbeg6c9U2ewf2Uq2cAioE/out.png"
    },
    {
        id: "delta-lock/ponynai3:848da0d3e5a762b8662592acd1818003a3b4672f513d7250895bd0d96c6a48c9",
        name: "PonyNai",
        provider: "Replicate",
        features: ["character_reference"],
        image: "https://replicate.delivery/xezq/Z0fpC39b1awejU1b0CqGnleieJnyd0p1ZHN7WW0KINJLDNuSB/0.png"
    },

    /**
     * Minimax
     */
    {
        id: "minimax/image-01",
        name: "Minimax",
        provider: "Replicate",
        features: ["character_reference"],
        image: "https://tjzk.replicate.delivery/models_models_cover_image/926994db-2c8e-4b7d-934f-2f86b2480e55/43b05178-4b2a-42d9-9130-4fedae65.webp"
    },
]
