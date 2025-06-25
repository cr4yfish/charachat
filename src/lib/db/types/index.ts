import { JSONObject } from "@ai-sdk/provider";
import { Profile } from "./profile";

export interface LoadMoreProps {
    cursor: number;
    limit: number;
    args?: JSONObject
}

export type Lora = {
    url: string;
    activation?: string;
    title: string;
}

export type Stats = {
    timeframe: string;
    count: number;
    accumulated_count: number;
}

export type API_Count = {
    api_key: string;
    count: number;
}

/**
 * @dep
 */
export type User_Tier = {
    user: Profile;
    tier: number;
}

export type Tag = {
    id: string;
    created_at?: string;
    name: string;
    description: string;
}



export type Leaderboard = {
    user: string; // id
    username: string;
    avatar_link: string;
    total_chat_count: number;
    position?: number;
}

