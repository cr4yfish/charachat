import { Character } from "./character";
import { Profile } from "./profile";

/**
 * @deprecated
 */
export type Story = {
    id: string;
    created_at?: string;
    creator: Profile;
    character: Character;
    title: string;
    description: string;
    image_link: string;
    story: string;
    first_message: string;
    chats?: number;
    likes?: number;
    is_private: boolean;
    extra_characters?: string[];
    extra_characters_client?: Character[];
}