"use server";

import Link from "next/link";

import { Input } from "@nextui-org/input";
import { Button } from "@/components/utils/Button";
import { saveCharacter } from "./actions";
import Icon from "@/components/utils/Icon";
import TextareaWithCounter from "@/components/utils/TextareaWithCounter";

export default async function NewCharacter() {

    return (
        <>
        <div className="flex items-center gap-2">
            <Link href="/"><Button variant="light" isIconOnly><Icon filled>arrow_back</Icon></Button></Link>
            <h2 className="font-bold text-2xl">Create a new Character</h2>
        </div>
        
        <form className="flex flex-col gap-4">
            <TextareaWithCounter 
                name="name" 
                isRequired
                label="Character Name"
                placeholder="Albert Einstein"
                description="Name of the Character" 
                maxLength={28}
                minRows={1}
                maxRows={1} 
            />
            <TextareaWithCounter 
                name="description" 
                isRequired
                label="Character Description"
                placeholder="Physicist, mathematician, and author"
                description="Very short description of the Character" 
                maxLength={50} 
            />
            <TextareaWithCounter 
                name="bio" 
                isRequired
                label="Character Bio"
                placeholder="Albert Einstein was a German-born theoretical physicist who developed the theory of relativity, one of the two pillars of modern physics. He was born in 1879 and died in 1955."
                description="Facts about the character. Who are they? What do they do? Where do they come from?" 
                maxLength={280} 
            />
            <Input name="image_link" isRequired label="Image Link" placeholder="https://i.imgur.com/XgbZdeAb.jpg" description="Direct link to an image" />
            <TextareaWithCounter 
                name="intro" 
                label="Character Intro"
                isRequired
                placeholder="Hello, I'm Albert Einstein. I'm a physicist, mathematician, and author. I developed the theory of relativity, one of the two pillars of modern physics."
                description="Introduction of the character. Describe how the character would introduce themselves." 
                maxLength={280} 
            />
            <TextareaWithCounter 
                name="book" 
                label="Character Book"
                description="All background information you can provide - the more the better. Background stories, relationsships, example dialogs etc." 
                maxLength={1000} 
            />
            <Button formAction={saveCharacter} type="submit" color="primary" variant="shadow" size="lg" >Create</Button>
        </form>
        </>
    )
}