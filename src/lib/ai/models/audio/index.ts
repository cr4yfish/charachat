import { ProviderId } from "../providers"

export type AudioModelId = ""

export type AudioModel = {
    key: AudioModelId,
    name: string,
    usecase?: string,
    provider: ProviderId,
    tags?: string[]
}
