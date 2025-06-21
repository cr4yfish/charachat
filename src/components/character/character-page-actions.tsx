"use client";

import { setCharacterCookie } from "@/app/actions";
import { Button } from "../ui/button";
import { HeartIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CharacterPageActions(props: { characterId: string }) {
    const router = useRouter();

    return (
        <>
        <Link href={`/chat`} onClick={(e) => {
            e.preventDefault();
            setCharacterCookie(props.characterId); // Replace with actual character ID
            router.push(`/chat`);        
        }}>
            <Button size="lg" color="primary"  >
                Start Chat
            </Button>
        </Link>

        <Button color="danger" variant="ghost" size="icon">
            <HeartIcon />
        </Button>
        
        </>
    )
}