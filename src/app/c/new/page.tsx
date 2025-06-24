

const CharacterBubbles = dynamic(() => import('@/components/new-character/character-bubbles'));
import NewCharacterFromScratch from "@/components/new-character/new-character-from-scratch";
import { Character } from "@/types/db";
import { ChevronRightIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import Image from "next/image";
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
        <div className="px-4 flex flex-col size-full pt-[75px] pb-[100px] items-center justify-center overflow-hidden relative z-10">
        
            {/* Char bubbles */}
            <div className="absolute top-0 left-0 size-full flex items-center justify-center z-0 overflow-visible opacity-50">
              <CharacterBubbles />  
            </div>
            
            {/* CTA -> opens drawer */}
            <div className="max-w-lg z-50">
                <NewCharacterFromScratch initCharacter={newChar} defaultOpen={isImport === "true"} />
            </div>

            {/* Link to importers */}
            <div className="w-full flex items-center justify-center mt-8 pb-4">
                <Link href={"/c/new/import"} className=" text-muted-foreground flex items-center gap-1" >
                    Import instead
                    <ChevronRightIcon size={14} />
                </Link>
            </div>        
        </div>

        {/* Background gradient */}
        <div className="absolute bottom-0 left-0 size-full backdrop-blur-[1px] z-[1] overflow-hidden">
            <div className="size-full bg-gradient-to-tr from-primary/20 to-background animate-[gradient_8s_ease-in-out_infinite] opacity-80"></div>
            <div className="absolute inset-0 size-full bg-gradient-to-bl from-primary/10 to-transparent animate-[gradient_12s_ease-in-out_infinite_reverse] opacity-60"></div>
        </div>

        {/* Background image */}
        <div className="absolute bottom-0 left-0 size-full z-0 opacity-15 ">
            <Image 
                alt="" fill
                className="object-cover"
                src={"/images/rep2.webp"}
            />
        </div>
        </>
    )
}