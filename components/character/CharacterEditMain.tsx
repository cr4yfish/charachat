"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/utils/Button";
import { Character } from "@/types/db";
import TextareaWithCounter from "../utils/TextareaWithCounter";
import { deleteCharacter, updateCharacter } from "@/functions/db/character";
import CategoryAutocomplete from "./CategoryAutocomplete";
import SaveDeleteButton from "../utils/SaveDeleteButton";
import { Switch } from "@nextui-org/switch";
import Icon from "../utils/Icon";
import ImageInputWithAI from "../ImageInputWithAI";
import CharacterCard from "./CharacterCard";
import { _CHARACTER_MAX_LENGTH } from "@/lib/maxLength";
import { Input } from "@nextui-org/input";

type Props = {
    character: Character
}

export default function CharacterEditMain(props: Props) {
    const router = useRouter();
    const [character, setCharacter] = useState<Character>(props.character);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast()

    const handleUpdateCharacter = async () => {
        if(isDeleting) return;
        
        setIsLoading(true);
        try {
            await updateCharacter(character);
            toast({
                title: "Saved Character",
                variant: "success"
            });
        } catch {
            toast({
                title: "Could not update character",
                description: "Some error occured while updating the character",
                variant: "destructive"
            });
        }
 
        setIsLoading(false);
    }

    const handleDeleteCharacter = async () => {
        try {
            await deleteCharacter(character.id);
            router.replace("/");
        } catch {
            toast({
                title: "Could not delete character",
                description: "Some error occured while deleting the character",
                variant: "destructive"
            });
            setIsDeleting(false);
        }
    }

    return (
        <>
        <form className="flex flex-col gap-4">
            <TextareaWithCounter 
                name="name" 
                isRequired
                value={character.name}
                onValueChange={(value) => setCharacter({ ...character, name: value })}
                label="Character Name"
                placeholder="Albert Einstein"
                description="Name of the Character" 
                maxLength={_CHARACTER_MAX_LENGTH.name}
                minRows={1}
                maxRows={1} 
            />
            <TextareaWithCounter 
                name="description" 
                isRequired
                value={character.description}
                onValueChange={(value) => setCharacter({ ...character, description: value })}
                label="Character Description"
                placeholder="Physicist, mathematician, and author"
                description="Very short description of the Character" 
                maxLength={_CHARACTER_MAX_LENGTH.description} 
            />
            <TextareaWithCounter 
                name="personality"
                isRequired
                value={character.personality}
                onValueChange={(value) => setCharacter({ ...character, personality: value })}
                label="Character Personality"
                placeholder="Curious, imaginative, and open-minded"
                description="Personality traits of the character"
                maxLength={_CHARACTER_MAX_LENGTH.personality}
            />
            <TextareaWithCounter 
                name="bio" 
                isRequired
                value={character.bio}
                onValueChange={(value) => setCharacter({ ...character, bio: value })}
                label="Character Bio"
                placeholder="Albert Einstein was a German-born theoretical physicist who developed the theory of relativity, one of the two pillars of modern physics. He was born in 1879 and died in 1955."
                description="Facts about the character. Who are they? What do they do? Where do they come from?" 
                maxLength={_CHARACTER_MAX_LENGTH.bio} 
            />
            <TextareaWithCounter 
                name="intro" 
                label="Character Intro"
                isRequired
                value={character.intro}
                onValueChange={(value) => setCharacter({ ...character, intro: value })}
                placeholder="Hello, I'm Albert Einstein. I'm a physicist, mathematician, and author. I developed the theory of relativity, one of the two pillars of modern physics."
                description="Introduction of the character. Describe how the character would introduce themselves." 
                maxLength={_CHARACTER_MAX_LENGTH.intro} 
            />
            <TextareaWithCounter 
                name="book" 
                value={character.book}
                onValueChange={(value) => setCharacter({ ...character, book: value })}
                label="Character Book"
                description="All background information you can provide - the more the better. Background stories, relationsships, example dialogs etc." 
                maxLength={_CHARACTER_MAX_LENGTH.book} 
            />
            <TextareaWithCounter
                name="first_message"
                value={character.first_message}
                onValueChange={(value) => setCharacter({ ...character, first_message: value })}
                label="First Message"
                description="The first message the character sends when the user starts the conversation (will be overriden by Story->First Message if in a Story) "
                maxLength={_CHARACTER_MAX_LENGTH.first_message}
            />
            <TextareaWithCounter 
                name="system_prompt" 
                value={character.system_prompt}
                onValueChange={(value) => setCharacter({ ...character, system_prompt: value })}
                label="System Prompt addition"
                description="Gets injected into the system prompt. Useful to set a chat-style." 
                maxLength={_CHARACTER_MAX_LENGTH.system_prompt} 
            />
            <TextareaWithCounter 
                name="image_prompt" 
                value={character.image_prompt}
                onValueChange={(value) => setCharacter({ ...character, image_prompt: value })}
                label="Image Prompt addition"
                description="Prefix for the image prompt. Useful to set a style (e.g. Anime)" 
                maxLength={_CHARACTER_MAX_LENGTH.image_prompt}
                maxRows={2} 
            />
            <Input 
                label="Speaker link" 
                description="Link to a .wav that's at least 6 seconds long as reference for voice cloning." 
                placeholder="https://example.com/speaker.wav"
                value={character.speaker_link}
                onValueChange={(value) => setCharacter({ ...character, speaker_link: value })}
            />
            <ImageInputWithAI
                contextFields={[character.image_prompt ?? "", character.name, character.description, character.personality, ]}
                imageLink={character.image_link}
                setImageLink={(image_link) => setCharacter({ ...character, image_link })}
            />
            <CategoryAutocomplete
                setCategory={(category) => setCharacter({ ...character, category })}
                defaultCategory={character.category}
            />

            <div className="flex flex-col gap-1">
                <Switch isSelected={character.is_private} onValueChange={(newValue) => setCharacter({ ...character, is_private: newValue })} >Private</Switch>
                <p className="text-xs dark:text-zinc-400">When set to Private, the <b>Character gets encrypted and only you will be able to see and interact with it</b>. Note that it might still appear on the front page, but only you will see it. Please avoid this if possible to contribute to the Project.</p>
            </div>
                       
            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold">Preview</h3>
                <CharacterCard fullWidth data={character} hasLink={false} />
            </div>
       
            
            <div className="flex flex-row max-w-xs w-full items-center gap-4 flex-wrap max-md:flex-col max-md:max-w-lg">
                <div className="w-md max-md:w-full">
                    <Button 
                        onClick={handleUpdateCharacter} 
                        type="submit" color="primary" 
                        fullWidth
                        startContent={<Icon filled>save</Icon>}
                        size="lg" isDisabled={isDeleting}
                        isLoading={isLoading}
                    >
                        Save
                    </Button>
                </div>
                <div className="w-md max-md:w-full">
                    <SaveDeleteButton 
                        isLoading={isDeleting}
                        onDelete={handleDeleteCharacter}
                    />
                </div>
            </div>

        </form>
        </>
    )
}