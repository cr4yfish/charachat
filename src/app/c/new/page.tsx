

const CharacterBubbles = dynamic(() => import('@/components/new-character/character-bubbles'));
import NewCharacterFromScratch from "@/components/new-character/new-character-from-scratch";
import { Character } from "@/types/db";
import { ChevronRightIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

export default async function NewCharPage({ searchParams }: { searchParams: Promise<{ isImport?: string | undefined }>}) {
    const { isImport="false" } = await searchParams;
    const cookieStore = await cookies();

    const charCookie = cookieStore.get("new_character")?.value; // This would be replaced with a call to getCharacterFromCookie() if needed
    let newChar: Character | undefined;

    if(charCookie) {
        try {
            newChar = JSON.parse(charCookie) as Character;
        } catch (e) {
            console.error("Failed to parse character cookie:", e);
        }
    }

    if((newChar && newChar.id.length === 0) || !newChar) {
        newChar = {
            id: uuidv4(),
        } as Character; // Initialize a new character if cookie is empty or invalid
    }
    
    return (
        <>
        <div className="px-4 flex flex-col h-full pt-[75px] pb-[100px] justify-between overflow-hidden">
        
            <CharacterBubbles />
            <NewCharacterFromScratch initCharacter={newChar} defaultOpen={isImport === "true"} />

            <div className="w-full flex items-center justify-center pb-4">
                <Link href={"/c/new/import"} className=" text-muted-foreground flex items-center gap-1" >
                    Import instead
                    <ChevronRightIcon size={14} />
                </Link>
            </div>

            <div className=" absolute bottom-0 left-0 size-full bg-gradient-to-tr from-primary/20 to-background -z-10 "></div>
        </div>
        </>
    )
}