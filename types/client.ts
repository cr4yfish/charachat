import { JSONObject } from "@ai-sdk/provider";


export interface LoadMoreProps {
    cursor: number;
    limit: number;
    args?: JSONObject
}