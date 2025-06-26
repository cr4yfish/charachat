import ImageWithBlur from "@/components/image/imageWithBlur";
import PersonaTopHeader from "@/components/personas/persona-top-header";
import Username from "@/components/user/username";
import { getPersona } from "@/lib/db/persona";
import { safeParseLink } from "@/lib/utils/text";
import { currentUser } from "@clerk/nextjs/server";
import { LockIcon } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Markdown from "react-markdown";



type Params = Promise<{ id: string }>

export async function generateMetadata(
    { params } : { params: Params }
) : Promise<Metadata> {
    
    try {
        const { id } = await params;
        const persona = await getPersona(id);

        return {
            title: `${persona.full_name}`,
        }
        
    } catch (error) {
        console.error(error);
        return {
            title: `Viewing Persona`,
        }   
    }
}

export default async function PersonaPage({ params }: { params: Params }) {
    const { id } = await params;

    const persona = await getPersona(id);
    const user = await currentUser();

    const isOwner = user?.id === persona.creator.id || user?.id === persona.clerk_user_id;

    return (
        <div className="relative w-full h-full min-h-full">
            
            <PersonaTopHeader persona={persona} isOwner={isOwner} />
            
            <div className="flex flex-col items-center gap-4 pb-20 px-6 py-6 relative h-full overflow-x-hidden pt-[75px]">
                <div className=" -z-10 absolute top-0 left-0 w-full h-full blur-3xl opacity-15 overflow-hidden">
                    <Image src={safeParseLink(persona.avatar_link)} layout="fill" className="object-cover" alt="" />
                </div>
                
                <div className="flex flex-row max-lg:flex-col gap-6 items-start max-lg:items-center justify-center w-full">

                    <div className="flex flex-col justify-center gap-4 max-lg:w-full">
                        <div className="flex flex-col gap-2 items-center justify-center">
                            <div className="w-32 h-32">
                                <ImageWithBlur 
                                    src={safeParseLink(persona.avatar_link)} 
                                    className="w-32 h-32 overflow-hidden p-0" 
                                    alt={persona.full_name ?? "avatar"} 
                                    sizes="128px" 
                                    fill
                                    radius="rounded-full"
                                    is_nsfw={false}
                                    aspectRatio={1/1}
                                />
                            </div>
                            <h1 className="text-xl font-bold">{persona.full_name}</h1>
                            <Username profile={persona.creator} hasLink textSize="sm" />
                        </div>

                        <div className="w-full flex items-center justify-center gap-2">
                            {/* <CharacterPageActions characterId={character.id} /> */}
                        </div>

                        {persona.is_private && 
                            <div className="flex flex-col gap-1 border border-green-500 rounded-lg p-2">
                                <div className="flex items-center gap-1 text-green-500">
                                    <LockIcon color="currentColor" />
                                    <span className="text-sm">Private</span>
                                </div>
                                <span className="text-xs dark:text-zinc-400">This Character is only accessible by you and otherwise encrypted.</span>
                            </div>
                        }

                        <div className="dark:prose-invert max-w-[690px] !select-none">
                            <Markdown>{persona.bio}</Markdown>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}