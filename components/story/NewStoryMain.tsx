"use client";

import { v4 as uuid } from "uuid";
import { Input } from "@nextui-org/input";
import { useRouter } from "next/navigation";

import { Character, Profile, Story } from "@/types/db";
import { Button } from "@/components/utils/Button";
import { FormEvent, useState } from "react";
import StoryInputWithAI from "./StoryInputWithAI";
import CharacterCard from "../character/CharacterCard";
import { storySchema } from "@/lib/schemas";
import { createStory, deleteStory } from "@/functions/db/stories";
import SaveDeleteButton from "../utils/SaveDeleteButton";
import Icon from "../utils/Icon";


type Props = {
    profile: Profile;
    character: Character;
    editMode?: boolean;
    story?: Story;
}

export default function NewStoryMain(props: Props) {
    const router = useRouter();
    const [story, setStory] = useState<Story>({
        id: props.story?.id || uuid(),
        creator: props.profile,
        character: props.character,
        title: props.story?.title || "",
        description: props.story?.description || "",
        story: props.story?.story || "",
        first_message: props.story?.first_message || "",
        image_link: props.story?.image_link || "",
    })

    const [errorMessages, setErrorMessages] = useState<{
        title: string | undefined,
        description: string | undefined,
        story: string | undefined,
        first_message: string | undefined,
        image_link: string | undefined,
    }>();

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Validate the Story
            const titleResult = storySchema.shape.title.safeParse(story.title);
            const descriptionResult = storySchema.shape.description.safeParse(story.description);
            const storyResult = storySchema.shape.story.safeParse(story.story);
            const firstMessageResult = storySchema.shape.first_message.safeParse(story.first_message);
            const imageLinkResult = storySchema.shape.image_link.safeParse(story.image_link);

            setErrorMessages({
                title: titleResult.error?.issues[0].message,
                description: descriptionResult.error?.issues[0].message,
                story: storyResult.error?.issues[0].message,
                first_message: firstMessageResult.error?.issues[0].message,
                image_link: imageLinkResult.error?.issues[0].message,
            })

            if(titleResult.success && descriptionResult.success && storyResult.success && firstMessageResult.success && imageLinkResult.success) {
                // Submit the Story
                await createStory({
                    storyId: story.id,
                    userId: props.profile.user,
                    characterId: story.character.id,
                    title: story.title,
                    description: story.description,
                    story: story.story,
                    first_message: story.first_message,
                    image_link: story.image_link
                });

                setIsSaved(true);
                if(!props.editMode) {
                    window.location.href = `/c/${story.character.id}/story/${story.id}`;
                } else {
                    setIsSaving(false);
                }
            } else {
                setIsSaved(false);
            }
        } catch (error) {
            console.error(error);
            setIsSaved(false);
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true);
        // Delete the Story
        try {
            const res = await deleteStory(story.id);
            window.location.href = `/c/${story.character.id}`;
        } catch (e) {
            console.error(e);
        }
        setIsDeleting(false);        
    }

    const updateValue = (key: string, value: string) => {
        setStory(prevValue => {
            return {
                ...prevValue,
                [key]: value
            }
        })
    }

    return (
        <>

        <CharacterCard fullWidth hasLink={false} character={props.character} />
                
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">Story Details</h2>

            <StoryInputWithAI 
                story={story}
                profile={props.profile}
                character={props.character}
                initValue={story.title}
                setValue={(value) => updateValue("title", value)}
                label="Story Title"
                name="title"
                placeholder="The Great Adventure of the cat"
                description="Name of the Story" 
                maxLength={50}
                isRequired
                buttonLabel="Generate Title"
                api="/api/author/story/title"
                maxRows={1}
                minRows={1}
                isInvalid={errorMessages?.title !== undefined}
                errorMessage={errorMessages?.title}
            />

            <StoryInputWithAI 
                story={story}
                profile={props.profile}
                character={props.character}
                initValue={story.description}
                setValue={(value) => updateValue("description", value)}
                label="Story Description"
                name="description"
                placeholder="The cat is on a journey to find the lost treasure"
                description="Short Description of the Story. Will be used as a summary."
                maxLength={350}
                isRequired
                buttonLabel="Generate Description"
                api="/api/author/story/description"
                isInvalid={errorMessages?.description !== undefined}
                errorMessage={errorMessages?.description}
            />

            <StoryInputWithAI 
                story={story}
                profile={props.profile}
                character={props.character}
                initValue={story.story}
                setValue={(value) => updateValue("story", value)}
                label="Story"
                name="story"
                description="The Story itself. Write in Natural Language. Is used as a backstory."
                maxLength={2000}
                isRequired
                buttonLabel="Generate Story"
                api="/api/author/story/story"
                isInvalid={errorMessages?.story !== undefined}
                errorMessage={errorMessages?.story}
            />

            <StoryInputWithAI 
                story={story}
                profile={props.profile}
                character={props.character}
                initValue={story.first_message}
                setValue={(value) => updateValue("first_message", value)}
                label="First Message"
                name="first_message"
                description="The first message in the Story Chat, like a kick-off."
                maxLength={500}
                isRequired
                buttonLabel="Generate First Message"
                api="/api/author/story/first_message"
                isInvalid={errorMessages?.first_message !== undefined}
                errorMessage={errorMessages?.first_message}
            />
            
            <Input 
                name="image_link" 
                isRequired 
                label="Story Image Link" 
                placeholder="https://i.imgur.com/XgbZdeAb.jpg" 
                description="Direct link to an image" 
                value={story.image_link}
                onValueChange={(value) => updateValue("image_link", value)}
                isInvalid={errorMessages?.image_link !== undefined}
                errorMessage={errorMessages?.image_link}
            />
            <Button 
                isLoading={isSaving} 
                isDisabled={isSaved}
                type="submit" 
                color={isSaved ? "success" : "primary"}
                variant="shadow" 
                startContent={props.editMode ? <Icon filled>save</Icon> : <Icon>add</Icon>}
                size="lg" 
            >
                {!props.editMode && (isSaved ? "Redirecting" : "Create Story")}
                {props.editMode && (isSaved ? "Saved" : "Save")}
            </Button>
            {props.editMode && 
                <SaveDeleteButton 
                    onDelete={handleDelete}
                    isLoading={isDeleting}
                    isDisabled={isSaving}
                />
            }
        </form>
        
        </>
    )
}