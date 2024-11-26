"use client";

import { Switch } from "@nextui-org/switch";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

import TextareaWithCounter from "../utils/TextareaWithCounter";
import CategoryAutocomplete from "./CategoryAutocomplete";
import { useState } from "react";
import { saveCharacter } from "@/app/c/new/actions";
import { Button } from "../utils/Button";
import { Character, Profile } from "@/types/db";
import StoryInputWithAI from "../story/StoryInputWithAI";
import CharacterCard from "./CharacterCard";
import { getKeyClientSide } from "@/lib/crypto";
import { encryptCharacter } from "@/functions/db/character";
import ImageInputWithAI from "../ImageInputWithAI";

type Props = {
    initCharacter: Character;
    profile: Profile
}

export default function CharacterNew(props: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [newCharacter, setNewCharacter] = useState<Character>(props.initCharacter);
    const { toast } = useToast();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsLoading(true);

        try {        

            let charToSave = newCharacter;

            if(newCharacter.is_private) {
                // encrypt shit
                const key = getKeyClientSide();
                charToSave = await encryptCharacter(newCharacter, key);

            }

            const res = await saveCharacter(charToSave);

            if(res.error.length > 1) {
                throw new Error(res.error)
            } else if(res.data) {
                setIsDone(true)
                toast({
                    title: "Success",
                    description: "Character was created successfully",
                    variant: "success"
                })
                router.replace(`/c/${res.data.id}`)
            }

            
        } catch(e) {
            const err = e as Error;
            console.error(err.message);
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
        }

        setIsLoading(false);
    }

    const updateValue = (name: string, value: string | boolean) => {
        setNewCharacter({
            ...newCharacter,
            [name]: value
        })
    }

    return (
        <>
        <form className="flex flex-col gap-4 h-full" onSubmit={handleSubmit}>
            <TextareaWithCounter 
                name="name" 
                isRequired
                label="Character Name"
                placeholder="Albert Einstein"
                description="Name of the Character" 
                maxLength={100}
                minRows={1}
                maxRows={1}
                value={newCharacter.name}
                onValueChange={(value) => updateValue("name", value)} 
            />
            <StoryInputWithAI 
                name="description" 
                isRequired
                label="Character Description"
                placeholder="Physicist, mathematician, and author"
                description="Very short description of the Character" 
                maxLength={5000} 
                initValue={newCharacter.description}
                setValue={(value) => updateValue("description", value)}
                character={newCharacter}
                profile={props.profile}
                buttonLabel="Generate Description"
                api="/api/author/character/description"
            />
            <StoryInputWithAI 
                name="personality"
                isRequired
                label="Character Personality"
                placeholder="Curious, imaginative, and open-minded"
                description="Personality traits of the character"
                maxLength={1000}
                initValue={newCharacter.personality}
                setValue={(value) => updateValue("personality", value)}
                character={newCharacter}
                profile={props.profile}
                buttonLabel="Generate Personality"
                api="/api/author/character/personality"
            />
            <StoryInputWithAI 
                name="bio" 
                isRequired
                label="Character Bio"
                placeholder="Albert Einstein was a German-born theoretical physicist who developed the theory of relativity, one of the two pillars of modern physics. He was born in 1879 and died in 1955."
                description="Facts about the character. Who are they? What do they do? Where do they come from?" 
                maxLength={5000} 
                initValue={newCharacter.bio}
                profile={props.profile}
                buttonLabel="Generate Bio"
                api="/api/author/character/bio"
                character={newCharacter}
                setValue={(value) => updateValue("bio", value)}
            />
            <ImageInputWithAI
                character={newCharacter} 
                setImageLink={(link) => updateValue("image_link", link)} 
            />
            <StoryInputWithAI 
                name="intro" 
                label="Character Intro"
                buttonLabel="Generate Intro"
                api="/api/author/character/intro"
                profile={props.profile}
                isRequired
                placeholder="Hello, I'm Albert Einstein. I'm a physicist, mathematician, and author. I developed the theory of relativity, one of the two pillars of modern physics."
                description="Introduction of the character. Describe how the character would introduce themselves." 
                maxLength={5000} 
                initValue={newCharacter.intro}
                character={newCharacter}
                setValue={(value) => updateValue("intro", value)}
            />
            <StoryInputWithAI 
                name="book" 
                label="Character Book"
                initValue={newCharacter.book}
                setValue={(value) => updateValue("book", value)}
                description="All background information you can provide - the more the better. Background stories, relationsships, example dialogs etc." 
                maxLength={8000} 
                isRequired
                buttonLabel="Generate Book"
                api="/api/author/character/book"
                profile={props.profile}
                character={newCharacter}
            />
            <TextareaWithCounter
                name="first_message"
                value={newCharacter.first_message}
                onValueChange={(value) => updateValue("first_message", value)}
                label="First Message"
                description="The first message the character sends when the user starts the conversation (will be overriden by Story->First Message if in a Story) "
                maxLength={5000}
            />
            <TextareaWithCounter 
                name="system_prompt" 
                value={newCharacter.system_prompt}
                onValueChange={(value) => updateValue("system_prompt", value )}
                label="System Prompt addition"
                description="Gets injected into the system prompt. Useful to set a chat-style." 
                maxLength={500} 
            />
            <TextareaWithCounter 
                name="image_prompt" 
                value={newCharacter.image_prompt}
                onValueChange={(value) => updateValue("image_prompt", value )}
                label="Image Prompt addition"
                description="Prefix for the image prompt. Useful to set a style (e.g. Anime)" 
                maxLength={100}
                maxRows={2} 
            />

            <CategoryAutocomplete 
                setCategory={(category) => updateValue("category", category.id)}
            />

            <div className="flex flex-col gap-1">
                <Switch isSelected={newCharacter.is_private} onValueChange={(newValue) => updateValue("is_private", newValue)} >Private</Switch>
                <p className="text-xs dark:text-zinc-400">When set to Private, the <b>Character gets encrypted and only you will be able to see and interact with it</b>. Note that it might still appear on the front page, but only you will see it. Please avoid this if possible to contribute to the Project.</p>
            </div>
           
            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold">Preview</h3>
                <CharacterCard fullWidth data={newCharacter} hasLink={false} />
            </div>
       

            <div className=" max-w-xs max-md:max-w-full ">
                <Button
                    type="submit" 
                    isLoading={isLoading || isDone}
                    isDisabled={isDone}
                    fullWidth
                    color={isDone ? "success" : "primary"}
                    size="lg" 
                >
                    {isDone ? "Redirecting" : "Save Character"}
                </Button>
            </div>
        </form>
        </>
    )
}