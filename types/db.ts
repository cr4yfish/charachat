
import { User } from "@supabase/supabase-js";

export type Character = {
    id: string;
    created_at?: string;
    owner: Profile;
    name: string;
    description: string;
    avatar: string;
    avatarUrl?: string;
    image_link?: string;
    bio: string;
    intro: string;
    book: string;
}

export type Chat = {
    id: string;
    created_at?: string;
    user: Profile;
    title: string;
    description: string;
    character: Character;
    last_message_at?: string;
    dynamic_book?: string;
}

export type Profile = {
    user: User;
    created_at?: string;
    username: string;
    first_name: string;
    last_name: string;
    bio?: string;
}

export type Story = {
    id: string;
    created_at?: string;
    creator: Profile;
    character: Character;
    name: string;
    description: string;
    image: string;
    story: string;
}

export type Message = {
    id: string;
    created_at?: string;
    chat: Chat;
    character: Character;
    user: Profile;
    from_ai: boolean;
    image?: string;
    content: string;
    is_edited: boolean;
    last_edited_at?: string;
    is_deleted: boolean;
    deleted_at?: string;
}

export type Tag = {
    id: string;
    created_at?: string;
    creator: Profile;
    name: string;
    description: string;
}