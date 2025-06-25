import { Profile } from "./profile";

export type Persona = {
    id: string;
    created_at?: string;
    full_name: string;
    bio?: string;
    avatar_link?: string;
    creator: Profile;
    is_private: boolean;
    description?: string;
    clerk_user_id?: string;
}
