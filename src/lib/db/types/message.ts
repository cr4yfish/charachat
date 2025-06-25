import { Character } from "./character";
import { Chat } from "./chat";
import { Profile } from "./profile";

export type Message = {
    id: string;
    created_at: string;
    chat: Chat;
    character?: Character;
    user?: Profile;
    clerk_user_id?: string;
    from_ai: boolean;
    content: string;
}
