"use client";

import { Input } from "@nextui-org/input";
import { Switch } from "@nextui-org/switch";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

import TextareaWithCounter from "../utils/TextareaWithCounter";
import CategoryAutocomplete from "./CategoryAutocomplete";
import { useState } from "react";
import { saveCharacter } from "@/app/c/new/actions";
import { Button } from "../utils/Button";
import { Character } from "@/types/db";


export default function CharacterNewMain() {

    const [isLoading, setIsLoading] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [newCharacter, setNewCharacter] = useState<Character>({} as Character);
    const { toast } = useToast();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsLoading(true);

        try {        
            const res = await saveCharacter(newCharacter);

            if(res.error.length > 1) {
                throw new Error(res.error)
            } else if(res.data) {
                setIsDone(true)
                toast({
                    title: "Success",
                    description: "Character was created successfully",
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

    const updateValue = (name: string, value: string) => {
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
                maxLength={28}
                minRows={1}
                maxRows={1}
                value={newCharacter.name}
                onValueChange={(value) => updateValue("name", value)} 
            />
            <TextareaWithCounter 
                name="description" 
                isRequired
                label="Character Description"
                placeholder="Physicist, mathematician, and author"
                description="Very short description of the Character" 
                maxLength={50} 
                value={newCharacter.description}
                onValueChange={(value) => updateValue("description", value)}
            />
            <TextareaWithCounter 
                name="bio" 
                isRequired
                label="Character Bio"
                placeholder="Albert Einstein was a German-born theoretical physicist who developed the theory of relativity, one of the two pillars of modern physics. He was born in 1879 and died in 1955."
                description="Facts about the character. Who are they? What do they do? Where do they come from?" 
                maxLength={280} 
                value={newCharacter.bio}
                onValueChange={(value) => updateValue("bio", value)}
            />
            <Input 
                name="image_link" 
                isRequired 
                label="Image Link" 
                placeholder="https://i.imgur.com/XgbZdeAb.jpg" 
                description="Direct link to an image" 
                value={newCharacter.image_link}
                onValueChange={(value) => updateValue("image_link", value)}
            />
            <TextareaWithCounter 
                name="intro" 
                label="Character Intro"
                isRequired
                placeholder="Hello, I'm Albert Einstein. I'm a physicist, mathematician, and author. I developed the theory of relativity, one of the two pillars of modern physics."
                description="Introduction of the character. Describe how the character would introduce themselves." 
                maxLength={280} 
                value={newCharacter.intro}
                onValueChange={(value) => updateValue("intro", value)}
            />
            <TextareaWithCounter 
                name="book" 
                label="Character Book"
                description="All background information you can provide - the more the better. Background stories, relationsships, example dialogs etc." 
                maxLength={1000} 
            />
            <CategoryAutocomplete 
                setCategory={(category) => updateValue("category", category.id)}
            />
            <Switch isDisabled>Private</Switch>
            <Button
                type="submit" 
                isLoading={isLoading || isDone}
                isDisabled={isDone}
                color={isDone ? "success" : "primary"}
                variant="shadow" 
                size="lg" 
            >
                {isDone ? "Redirecting" : "Save Character"}
            </Button>
        </form>
        </>
    )
}