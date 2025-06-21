import { Character } from "@/types/db";
import Markdown from "react-markdown";
import { safeParseLink } from "@/lib/utils";
import Image from "next/image";
import { Metadata } from "next";
import { getCharacter } from "@/lib/db/character";
import ImageWithBlur from "@/components/image/imageWithBlur";
import Username from "@/components/user/username";
import { HeartIcon, LockIcon, MessageCircleIcon } from "lucide-react";
// import CharacterPageActions from "@/components/character/character-page-actions";
import CharacterPageTabs from "@/components/character/character-page-tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

    // const palette = await Vibrant.from(safeParseLink(character.image_link))
    //     .getPalette()
    //     .catch((err) => {
    //         console.error("Error getting palette, skipping it:", err, "Character:", character.name);
    //         return null;
    // });

    return (
        <>
        <div className="relative w-full h-full min-h-full">
            <div className="fixed top-0 left-0 w-full h-[75px] bg-gradient-to-b from-black/50 to-transparent z-50">
                <div className="relative size-full px-4 py-2 flex items-center justify-between">
                    <span className="text-3xl font-bold">{character.name}</span> 

                    <div>
                        <Link href={"/chat?characterid=" + character.id}>
                            <Button>
                                <MessageCircleIcon />
                                <span>Start Chat</span> 
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="absolute top-0 left-0 -z-10 size-full backdrop-blur-[1px] pointer-events-none " ></div>
            </div>
            

            <div className="flex flex-col items-center gap-4 pb-20 px-6 py-6 relative h-full overflow-x-hidden pt-[75px]">

                <div className=" -z-10 absolute top-0 left-0 w-full h-full blur-3xl opacity-15 overflow-hidden">
                    <Image src={safeParseLink(character.image_link)} layout="fill" className="object-cover" alt="" />
                </div>

                <div className="flex flex-row max-lg:flex-col gap-6 items-start max-lg:items-center justify-center w-full">

                    <div className="flex flex-col justify-center gap-4 max-lg:w-full">
                        <div className="flex flex-col gap-2 items-center justify-center">
                            <div className="w-32 h-32">
                                <ImageWithBlur 
                                    src={character.image_link} 
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

                        <div className="w-full flex items-center justify-center gap-2">
                            {/* <CharacterPageActions characterId={character.id} /> */}
                        </div>

                        {character.is_private && 
                            <div className="flex flex-col gap-1 border border-green-500 rounded-lg p-2">
                                <div className="flex items-center gap-1 text-green-500">
                                    <LockIcon color="currentColor" />
                                    <span className="text-sm">Private</span>
                                </div>
                                <span className="text-xs dark:text-zinc-400">This Character is only accessible by you and otherwise encrypted.</span>
                            </div>
                        }

                        <div className="flex flex-row flex-wrap gap-2 text-sm dark:text-zinc-200">
                            
                            <div className="flex items-center gap-2">
                                <MessageCircleIcon />
                                <span>{character.chats} Chats</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <HeartIcon />
                                <span>{character.likes} Likes</span>
                            </div>
                        </div>

                        <div className="dark:prose-invert prose-p:text-sm dark:prose-p:text-neutral-400 !select-none">
                            <Markdown>{character.description}</Markdown>
                        </div>
                        
                        {/* <div className="flex flex-row flex-wrap items-center gap-2">
                            <CategoryCard data={character.category} />
                            {character.speaker_link &&
                                <Card 
                                    className={`
                                        w-full max-w-fit flex items-center justify-center px-4 py-3 rounded-full bg-zinc-200/70 dark:bg-zinc-600/40
                                        backdrop-blur-xl border-1 dark:border-none shadow-none text-sm font-medium
                                    `}
                                    >
                                    <CardBody className="p-0 w-full min-w-max h-full flex flex-row items-center justify-center">
                                        Has customized Voice
                                    </CardBody>
                                </Card>
                            }
                            {character.tags_full?.map(tag => (
                            <Card 
                                key={tag.id}
                                className={`
                                    w-full max-w-fit flex items-center justify-center px-4 py-3 rounded-full bg-zinc-200/70 dark:bg-zinc-600/40
                                    backdrop-blur-xl border-1 dark:border-none shadow-none text-sm font-medium
                                `}
                            >
                                <CardBody className="p-0 w-full min-w-max h-full flex flex-row items-center justify-center">
                                    {tag.name}
                                </CardBody>
                            </Card>
                            ))}
                        </div> */}
                    </div>

                    <div className="flex flex-col w-full max-w-xl max-lg:max-w-full">
                        <CharacterPageTabs character={transformedCharacter} />
                    </div>
                </div>
            </div>
        </div>
        
        </>
    )

}