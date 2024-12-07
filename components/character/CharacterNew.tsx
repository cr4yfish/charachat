"use client";

import { Switch } from "@nextui-org/switch";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Separator } from "../ui/separator";
import TextareaWithCounter from "../utils/TextareaWithCounter";
import CategoryAutocomplete from "./CategoryAutocomplete";
import { useState } from "react";
import { saveCharacter } from "@/app/c/new/actions";
import { Button } from "../utils/Button";
import { Character, Profile, Tag } from "@/types/db";
import InputWithAI from "../story/InputWithAI";
import CharacterCard from "./CharacterCard";
import { getKeyClientSide } from "@/lib/crypto";
import { deleteCharacter, encryptCharacter, updateCharacter } from "@/functions/db/character";
import ImageInputWithAI from "../ImageInputWithAI";
import { _CHARACTER_MAX_LENGTH } from "@/lib/maxLength";
import { Input } from "@nextui-org/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import SaveDeleteButton from "../utils/SaveDeleteButton";
import Icon from "../utils/Icon";
import TagsSelect from "../TagsSelect";
import { Chip } from "@nextui-org/chip";

type Props = {
    initCharacter: Character;
    profile: Profile,
    editMode?: boolean
}

export default function CharacterNew(props: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [newCharacter, setNewCharacter] = useState<Character>(props.initCharacter);
    const { toast } = useToast();
    const router = useRouter();


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(props.editMode) {
            handleUpdateCharacter();
        } else {
            handleCreateCharacter();
        }

    }

    const handleCreateCharacter = async () => {
        if(
            !newCharacter.name ||
            !newCharacter.description ||
            !newCharacter.image_link ||
            !newCharacter.category
        ) {
            toast({
                title: "Please fill out all required fields",
                description: "Name, Description, Image and category are required",
                variant: "destructive"
            })  
            return;
        }

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

    const handleUpdateCharacter = async () => {
        if(isDeleting) return;
        
        setIsLoading(true);
        try {
            await updateCharacter(newCharacter);
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
            await deleteCharacter(newCharacter.id);
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

    const updateValue = (name: string, value: string | boolean | Tag[]) => {
        setNewCharacter({
            ...newCharacter,
            [name]: value
        })
    }

    return (
        <>
        <form className="flex flex-col gap-4 h-full pb-20" onSubmit={handleSubmit}>
            <div className="flex justify-center absolute bottom-0 left-0 z-20 w-full p-4 pb-6">
                <Button
                    type="submit" 
                    isLoading={isLoading || isDone}
                    isDisabled={isDone}
                    startContent={props.editMode ? <Icon filled>save</Icon> : <Icon>add</Icon>}
                    fullWidth
                    className="max-w-lg shadow-xl py-8"
                    radius="full"
                    color={isDone ? "success" : "primary"}
                    size="lg" 
                >
                    {!props.editMode && (isDone ? "Redirecting" : "Create Character")}
                    {props.editMode && (isDone ? "Saved" : "Save Character")}
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardDescription>This is basic information and needed to get the Character to work</CardDescription>
                    <CardTitle>Required</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <ImageInputWithAI
                        contextFields={[newCharacter.image_prompt ?? "", newCharacter.name, newCharacter.description, newCharacter.personality ?? " "]} 
                        imageLink={newCharacter.image_link}
                        setImageLink={(link) => updateValue("image_link", link)} 
                    />
                    <TextareaWithCounter 
                        name="name" 
                        isRequired
                        label="Character Name"
                        placeholder="Albert Einstein"
                        description="Name of the Character" 
                        maxLength={_CHARACTER_MAX_LENGTH.name}
                        minRows={1}
                        maxRows={1}
                        value={newCharacter.name}
                        onValueChange={(value) => updateValue("name", value)} 
                    />
                    <InputWithAI 
                        name="description" 
                        isRequired
                        label="Character Card Description"
                        placeholder="Physicist, mathematician, and author"
                        description="Short description of the Character used for the Character Card" 
                        maxLength={_CHARACTER_MAX_LENGTH.description} 
                        initValue={newCharacter.description}
                        setValue={(value) => updateValue("description", value)}
                        character={newCharacter}
                        profile={props.profile}
                        buttonLabel="Generate Description"
                        api="/api/author/character"
                    />
                    <CategoryAutocomplete 
                        defaultCategory={newCharacter.category}
                        setCategory={(category) => updateValue("category", category.id)}
                    />
                    <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex flex-col gap-2">
                        <h3 className="font-medium">Tags</h3>
                        <p className="text-xs dark:text-zinc-400">Tags are used to categorize the Character and make it easier to find.</p>
                        <div className="flex flex-row flex-wrap gap-2">
                            {newCharacter.tags_full?.map(tag => (
                                <Chip key={tag.id}>{tag?.name}</Chip>
                            ))}
                        </div>
                        <TagsSelect selectedTags={newCharacter.tags_full ?? []} onSelect={(tags) => updateValue("tags_full", tags)} />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Switch isSelected={newCharacter.is_private} onValueChange={(newValue) => updateValue("is_private", newValue)} >Private</Switch>
                        <p className="text-xs dark:text-zinc-400">When set to Private, the <b>Character gets encrypted and only you will be able to see and interact with it</b>. Note that it might still appear on the front page, but only you will see it. Please avoid this if possible to contribute to the Project.</p>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Switch isSelected={newCharacter.is_nsfw} onValueChange={(newValue) => updateValue("is_nsfw", newValue)} >NSFW</Switch>
                        <p className="text-xs dark:text-zinc-400">This will blur the Avatar.</p>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <Switch isSelected={newCharacter.is_unlisted} onValueChange={(newValue) => updateValue("is_unlisted", newValue)} >Unlisted</Switch>
                        <p className="text-xs dark:text-zinc-400">If checked, this Character won&apos;t appear on the homepage or in searches. Good for sharing Characters with others without making them easily accesible. Don&apos;t set it to private as well, others won&apos;t be able to access it then.</p>
                    </div>
                </CardContent>
 
            </Card>

            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold">Preview</h3>
                <CharacterCard fullWidth data={newCharacter} hasLink={false} />
            </div>
            
            <div>
                {props.editMode &&
                <SaveDeleteButton 
                    isLoading={isDeleting}
                    onDelete={handleDeleteCharacter}
                    label="Delete Character"
                />
                }
            </div>

            <Separator className="my-6" />

            <div>
                <p className="text-xs dark:text-zinc-400">You can leave these empty for now and fill them in later.</p>
                <h2>Optional Fields</h2>
            </div>
            <Card>
                <CardHeader>
                    <CardDescription>Try to fill these out as it will make a big impact to quality.</CardDescription>
                    <CardTitle>Recommended</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    { newCharacter.intro && newCharacter.intro.length > 0 &&
                        <div className="p-2 border border-red-500/50 bg-red-500/5 dark:bg-red-500/5 rounded-lg">
                            <p className="font-bold text-red-500 dark:text-red-500">ATTENTION! Please move the Introduction to the User Greeting. The Intro field will be removed soon.</p>
                            <TextareaWithCounter 
                                name="intro"
                                value={newCharacter.intro ?? ""}
                                onValueChange={(value) => updateValue("intro", value)}
                                maxLength={_CHARACTER_MAX_LENGTH.intro}
                                label="Character Introduction"
                            />
                        </div>
                    }
                    <InputWithAI 
                        name="personality"
                        label="Character Personality"
                        placeholder="Curious, imaginative, and open-minded"
                        description="Personality traits of the character"
                        maxLength={_CHARACTER_MAX_LENGTH.personality}
                        initValue={newCharacter.personality}
                        setValue={(value) => updateValue("personality", value)}
                        character={newCharacter}
                        profile={props.profile}
                        buttonLabel="Generate Personality"
                        api="/api/author/character"
                    />
                    <InputWithAI 
                        name="bio" 
                        label="Character Biography"
                        placeholder="Albert Einstein was a German-born theoretical physicist who developed the theory of relativity, one of the two pillars of modern physics. He was born in 1879 and died in 1955."
                        description="Facts about the character. Who are they? What do they do? Where do they come from?" 
                        maxLength={_CHARACTER_MAX_LENGTH.bio} 
                        initValue={newCharacter.bio}
                        profile={props.profile}
                        buttonLabel="Generate Bio"
                        api="/api/author/character"
                        character={newCharacter}
                        setValue={(value) => updateValue("bio", value)}
                    />
                    <InputWithAI
                        name="first_message"
                        initValue={newCharacter.first_message}
                        setValue={(value) => updateValue("first_message", value)}
                        label="User Greeting"
                        placeholder="Hello, I'm Albert Einstein. I'm a physicist, mathematician, and author. I developed the theory of relativity, one of the two pillars of modern physics."
                        description="The first message the character sends when the user starts the conversation (will be overriden by Story->First Message if in a Story) "
                        maxLength={_CHARACTER_MAX_LENGTH.first_message}
                        api="/api/author/character"
                        profile={props.profile}
                        character={newCharacter}
                        buttonLabel="Generate First Message"
                    />
                    <InputWithAI
                        name="scenario"
                        initValue={newCharacter.scenario}
                        setValue={(value) => updateValue("scenario", value)}
                        label="Simple Scenario"
                        placeholder="You walk into a room and see Albert Einstein sitting at a table, writing on a piece of paper. What do you do?"
                        description="A simple scenario to get the conversation started. Use this to set the scene for the user. For longer and/or complex scenarios, create a seperate Story for this Character."
                        maxLength={_CHARACTER_MAX_LENGTH.scenario}
                        api="/api/author/character"
                        profile={props.profile}
                        character={newCharacter}
                        buttonLabel="Generate Scenario"
                    />
                    <InputWithAI 
                        name="book" 
                        label="All other information"
                        initValue={newCharacter.book}
                        setValue={(value) => updateValue("book", value)}
                        description="All background information you can provide - the more the better. Background stories, relationsships, example dialogs etc." 
                        maxLength={_CHARACTER_MAX_LENGTH.book} 
                        buttonLabel="Generate Character Book"
                        api="/api/author/character"
                        profile={props.profile}
                        character={newCharacter}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardDescription>You can fine-tune Character behaviour with these. If you don&apos;t know what these are for, just leave them empty.</CardDescription>
                    <CardTitle>Advanced</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <InputWithAI 
                        name="system_prompt" 
                        initValue={newCharacter.system_prompt}
                        setValue={(value) => updateValue("system_prompt", value )}
                        label="System Prompt addition"
                        placeholder="Always respond to the user with a question to keep the conversation going."
                        description="Gets injected into the system prompt. Useful to set a chat-style." 
                        maxLength={_CHARACTER_MAX_LENGTH.system_prompt} 
                        buttonLabel="Generate System Prompt"
                        api="/api/author/character"
                        profile={props.profile}
                        character={newCharacter}
                    />
                    <InputWithAI 
                        name="image_prompt" 
                        initValue={newCharacter.image_prompt}
                        setValue={(value) => updateValue("image_prompt", value )}
                        label="Image Prompt Prefix"
                        placeholder="Photorealistic, picture, black and white, high quality"
                        description="Prefix for the image prompt. Useful to set a style (e.g. Anime)" 
                        maxLength={_CHARACTER_MAX_LENGTH.image_prompt}
                        maxRows={2} 
                        buttonLabel="Generate Image Prompt"
                        api="/api/author/character"
                        profile={props.profile}
                        character={newCharacter}
                    />
                    <Input 
                        label="Voice Cloning Speaker link" 
                        placeholder="https://link.to/speaker.wav"
                        description="Link to a .wav that's at least 6 seconds long as reference for voice cloning. You can leave it empty. There is a default voice if you don't provide one." 
                        value={newCharacter.speaker_link}
                        onValueChange={(value) => updateValue("speaker_link", value)}
                    />
                </CardContent>
            </Card>

        </form>
        </>
    )
}