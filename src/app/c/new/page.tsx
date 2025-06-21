import NewCharacterFromScratch from "@/components/new-character/new-character-from-scratch";
import { Character } from "@/types/db";
import { ChevronRightIcon } from "lucide-react";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { v4 as uuidv4 } from "uuid";

const PureImportOption = (props : { title: string, description: string, image?: string, href: string; }) => {
    return (
        <Link href={props.href} className="flex flex-row items-center relative">
            {props.image && 
                <div className="relative overflow-hidden rounded-2xl w-16 h-16 mr-3">
                    <Image 
                        src={props.image}
                        alt=""
                        fill
                        className="object-cover size-full"
                    />
                </div>
            }

            <div className="flex flex-col">
                <span className=" text-lg font-medium">{props.title}</span>
                <p className="text-neutral-500 text-sm">{props.description}</p>
            </div>

            <div className=" absolute right-0 h-full flex items-center justify-center text-neutral-500 dark:text-neutral-500 ">
                <ChevronRightIcon color="currentColor" />
            </div>
        </Link>
    );
}

const ImportOption = memo(PureImportOption, (prevProps, nextProps) => {
    // Only re-render if the title or description changes
    return prevProps.title === nextProps.title && prevProps.description === nextProps.description && prevProps.href === nextProps.href && prevProps.image === nextProps.image;
});

export default async function NewCharPage() {
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
        <div className="mt-[75px]"></div>
        <div className="px-4 flex flex-col gap-4">

            <NewCharacterFromScratch initCharacter={newChar} />

            <div className="flex flex-col gap-2">

                <h2 className="text-xl font-bold">Or import from a 3rd party</h2>

                <div className="flex flex-col gap-4 rounded-3xl bg-neutral-900 p-3">
                    <ImportOption 
                        title="Silly Tavern" 
                        description="Import directly from Silly Tavern" 
                        href="/c/new/silly-tavern"
                        image="https://styles.redditmedia.com/t5_88g8nv/styles/communityIcon_6uq5dtz9sa7b1.png"
                    />
                    <ImportOption 
                        title="JanitorAI" 
                        description="Archived characters from JanitorAI" 
                        href="/c/new/janitor"
                        image="https://imgs.search.brave.com/5rDbHbVEdoK1B4xWbpcZKUsK6XtemM0_RLpimgEAHDM/rs:fit:32:32:1:0/g:ce/aHR0cDovL2Zhdmlj/b25zLnNlYXJjaC5i/cmF2ZS5jb20vaWNv/bnMvMGU2NmI5MDU4/YWQ2MjVkNzZiNTFh/NjVmNjk3YzJjZTkx/ZWViYWMyZjdkZWQ3/ZTQyZjRlMTMxMzM2/YWQyYmNmOS93d3cu/amFuaXRvcmFpLmNv/bS8"
                    />
                    <ImportOption 
                        title="Anime" 
                        description="Import characters from anime" 
                        href="/c/new/anime"
                        image="https://imgs.search.brave.com/ZZeY-5yrGiK3yfzaoTJFoQARU78U_fUNHpJyjUMncTs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1waG90by9h/bmltZS1uaWdodC1z/a3ktaWxsdXN0cmF0/aW9uXzIzLTIxNTE2/ODQzMzAuanBnP3Nl/bXQ9YWlzX2h5YnJp/ZCZ3PTc0MA"
                    />
                    <ImportOption 
                        title="Fandom" 
                        description="Characters from Fandom wiki pages"
                        href="/c/new/fandom" 
                        image="https://imgs.search.brave.com/C5dewhsfFaCwEYAqjGuDTv0Z4pOn5f2IXzKOu1qjAdc/rs:fit:32:32:1:0/g:ce/aHR0cDovL2Zhdmlj/b25zLnNlYXJjaC5i/cmF2ZS5jb20vaWNv/bnMvODBjNTlhYWJh/ZTZkMjkzNmFjZDIx/ZDExOTgwZGY5Nzcy/ZWYwOWQ4MjM3ZWI3/ZjRlZTljOWU0ZTlj/YjE0YmY0NC93d3cu/ZmFuZG9tLmNvbS8"
                    />
                    <ImportOption 
                        title="Wikipedia" 
                        description="Characters from Wikipedia pages" 
                        href="/c/new/wikipedia"
                        image="https://imgs.search.brave.com/isGN_dS_WoFpc8EQKa1Iw4s3pCrXpLAE_Wn_ILqXW10/rs:fit:32:32:1:0/g:ce/aHR0cDovL2Zhdmlj/b25zLnNlYXJjaC5i/cmF2ZS5jb20vaWNv/bnMvZTY0NDY0YmVk/MjZlYjZhMjMwMmI3/OTZmNzM3N2JiOTAy/ODFjYzdiODA1NmE1/Mjk0ZTk1ZDkwYTA4/ZTFmOTMxZS9kZS53/aWtpcGVkaWEub3Jn/Lw"
                    />
                </div>

                <div>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">More import options coming soon!</p>
                </div>

            </div>
        </div>
        </>
    )
}