"use server";

import { Button } from "@/components/utils/Button";
import { getCharacter } from "@/functions/db/character";
import { Character, Story } from "@/types/db";
import { redirect } from "next/navigation";
import { startChat } from "./actions";
import { getCharacterChats } from "@/functions/db/chat";

import Link from "next/link";
import CharacterCard from "@/components/character/CharacterCard";
import CharacterDetailsAccordion from "@/components/character/CharacterDetailsAccordion";
import Icon from "@/components/utils/Icon";
import { getSession } from "@/functions/db/auth";
import ChatList from "@/components/chat/ChatList";
import BackLink from "@/components/utils/BackLink";
import { getCharacterStories } from "@/functions/db/stories";
import StoryCardSmall from "@/components/story/StoryCard";

export default async function CharacterView({ params: { characterId } }: { params: { characterId: string } }) {

    let character: Character | null = null;

    try {
        character = await getCharacter(characterId);
        
    } catch (error) {
        console.error(error);
        return <p>Character not found</p>;
    }

    const stories = await getCharacterStories(characterId);
    const userChats = await getCharacterChats(characterId);
    
    const { session } = await getSession();

    if(session?.user.id == null) {
        redirect("/auth");
    }

    return (
        <>

        <div className="z-20 absolute bottom-0 left-0 w-full flex items-center justify-center pb-5 px-4">
            <form className="w-full">
                <input type="hidden" name="characterId" value={characterId} />
                <Button size="lg" fullWidth color="primary" variant="shadow" type="submit" formAction={startChat} >Start Chat</Button>
            </form>
        </div>

        <div className="flex flex-col gap-4 pb-20 px-4 py-6">

            <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                    <BackLink />
                    <div className="flex items-center justify-between w-full">
                        <h2 className="prose dark:prose-invert font-bold text-2xl">{character.name}</h2>
                        {character.owner.user == session.user.id &&
                            <Link href={`/c/${character.id}/edit`}>
                                <Button isIconOnly variant="light" size="lg"><Icon filled>settings</Icon></Button>
                            </Link>
                        }   
                    </div>
      
                </div>
          
                <CharacterCard fullWidth hasLink={false} character={character} />

                <CharacterDetailsAccordion character={character} />
            </div>
                        
            <div className="flex flex-col gap-2">
                <h2 className="prose dark:prose-invert font-bold text-xl">Stories with {character.name}</h2>
                <div className="flex flex-col gap-2">
                    <Link href={`/c/${characterId}/story/new`}><Button variant="flat" color="secondary" fullWidth>Create Story</Button></Link>
                </div>
                <div className="flex flex-col gap-2">
                    {stories.map((story: Story) => (
                        <StoryCardSmall key={story.id} story={story} hasLink fullWidth />
                    ))}

                    {stories.length == 0 && <p>No stories found</p>}
                
                </div>
            </div>

            <ChatList initChats={userChats} character={character} />
            
        </div>
        </>
    )

}