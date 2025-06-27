import { Character } from "@/lib/db/types/character";
import Markdown from "react-markdown";
import { safeParseLink } from "@/lib/utils/text";
import Image from "next/image";
import { Metadata } from "next";
import { getCharacter } from "@/lib/db/character";
import ImageWithBlur from "@/components/image/imageWithBlur";
import Username from "@/components/user/username";
import CharacterPageTabs from "@/components/character/character-page-tabs";
import CharacterPageActions from "@/components/character/character-page-actions";
import CharacterTopHeader from "@/components/character/character-top-header";
import { currentUser } from "@clerk/nextjs/server";
import SmallChat from "@/components/chat/small-chat";

type Params = Promise<{ id: string }>

export async function generateMetadata(
    { params } : { params: Params }
) : Promise<Metadata> {
    
    try {
        const { id } = await params;
        const character = await getCharacter(id);

        return {
            title: `${character.name}`,
        }
        
    } catch (error) {
        console.error(error);
        return {
            title: `Viewing Characters`,
        }   
    }
}

export default async function CharacterView({ params }: { params: Params }) {

    const { id } = await params;

    const character = await getCharacter(id);

    const transformedCharacter: Character = character;
    if(character.hide_definition) {
        transformedCharacter.bio = "";
        transformedCharacter.book = "";
        transformedCharacter.intro = "";
        transformedCharacter.first_message = "";
        transformedCharacter.scenario = "";
        transformedCharacter.personality = "";
        transformedCharacter.system_prompt = "";
        transformedCharacter.image_prompt = "";
    }

    const user = await currentUser();

    let userIsOwner = false;

    if(user?.id && user.id === character.owner_clerk_user_id) {
        userIsOwner = true;
    }


    return (
        <>
        <div className="relative w-full h-full min-h-full ios-safe-header-padding-chats lg:!pt-0 ">

            <CharacterTopHeader isOwner={userIsOwner} character={character} />

            <div className="flex flex-col items-center gap-4 pb-20 px-6 py-6 relative h-full overflow-x-hidden pt-[75px]">

                <div className=" -z-10 absolute top-0 left-0 w-full h-full blur-3xl opacity-15 overflow-hidden">
                    <Image src={safeParseLink(character.image_link)} layout="fill" className="object-cover" alt="" />
                </div>

                <div className="flex flex-row max-lg:flex-col gap-6 items-start max-lg:items-center justify-center w-full">

                    <div className="flex flex-col justify-center gap-4 max-lg:w-full">
                        <div className="flex flex-col gap-2 items-center justify-center">
                            <div className="w-32 h-32">
                                <ImageWithBlur 
                                    src={safeParseLink(character.image_link)} 
                                    className="w-32 h-32 overflow-hidden p-0" 
                                    alt={character.name} 
                                    sizes="128px" 
                                    fill
                                    radius="rounded-full"
                                    is_nsfw={character.is_nsfw}
                                    aspectRatio={1/1}
                                />
                            </div>
                            <h1 className="text-xl font-bold">{character.name}</h1>
                            <Username profile={character.owner} hasLink textSize="sm" />
                        </div>
                            
                        <CharacterPageActions character={character} />

                        <div className="h-full min-h-[200px] max-h-[400px] shrink-0 flex flex-col gap-2">
                            <div className="prose dark:prose-invert">
                               <h2 >Test out {character.name}</h2> 
                            </div>
                            
                            <SmallChat character={character} />
                        </div>

                    </div>

    
                    <div className="flex flex-col gap-4 w-full max-w-xl max-lg:max-w-full">
                        <div className="prose dark:prose-invert max-w-[690px] !select-none">
                            <h2>Description</h2>
                            <Markdown>{character.description}</Markdown>
                        </div>

                        <CharacterPageTabs character={transformedCharacter} />
                    </div>
                </div>
            </div>
        </div>
        
        </>
    )

}