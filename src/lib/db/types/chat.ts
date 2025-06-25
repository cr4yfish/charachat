import { Character, ShallowCharacter } from "./character";
import { Persona } from "./persona";
import { Profile } from "./profile";
import { Story } from "./story";

export type Chat = {
    id: string;
    created_at?: string;
    user?: Profile;
    title: string;
    description: string;
    character: Character;
    last_message_at?: string;
    dynamic_book?: string;
    story?: Story;
    llm: string;
    last_message?: string;
    persona?: Persona;
    negative_prompt?: string;
    response_length: number;
    temperature: number;
    frequency_penalty: number;
    clerk_user_id?: string;
}

export type ShallowChat = {
    id: string;
    created_at?: string;
    user?: string;
    clerk_user_id?: string;
    title: string;
    description: string;
    character: ShallowCharacter;
    last_message_at?: string;
    last_message?: string;
}