import { Category } from "./category";
import { Profile } from "./profile";
import { Lora } from ".";

type Tag = {
    id: string;
    created_at?: string;
    name: string;
    description?: string;
}


export type Character = {
    id: string;
    created_at?: string;
    owner_clerk_user_id?: string;
    name: string;
    description?: string;
    image_link?: string;
    bio?: string;
    intro?: string;
    book?: string;
    category?: Category;
    is_private: boolean;
    is_nsfw?: boolean;
    is_unlisted?: boolean;
    hide_definition?: boolean;
    personality?: string;
    chats?: number;
    likes?: number;
    
    system_prompt?: string;
    image_prompt?: string;
    first_message?: string;
    
    scenario?: string;
    tags?: string[];
    
    /**
     * Only used client-side to display the character in the UI
    */
    tags_full?: Tag[];
    is_liked?: boolean;

    /**
     * @deprecated
     */
    loras?: Lora[];
    speaker_link?: string;
    owner?: Profile;

}

/**
 * Small version of Character type for shallow references
 * Used in chats and messages to reduce data size
 */
export type ShallowCharacter = {
    id?: string,
    name?: string,
    image_link?: string,
}