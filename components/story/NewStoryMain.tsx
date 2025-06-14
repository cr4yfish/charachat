"use client";

import { v4 as uuid } from "uuid";
import { Character, Profile, Story } from "@/types/db";
import { Button } from "@/components/utils/Button";
import { FormEvent, useState } from "react";
import InputWithAI from "./InputWithAI";
import CharacterCard from "../character/CharacterCard";
import { storySchema } from "@/lib/schemas";
import { createStory, deleteStory } from "@/functions/db/stories";
import SaveDeleteButton from "../utils/SaveDeleteButton";
import Icon from "../utils/Icon";
import ImageInputWithAI from "../ImageInputWithAI";
import StoryCard from "./StoryCard";
import { _STORY_MAX_LENGHT } from "@/lib/maxLength";
import ExtraCharacterSelect from "./ExtraCharacterSelect";
import CharacterAvatarButton from "../character/CharacterAvatarButton";


type Props = {
    profile: Profile;
    character: Character;
    editMode?: boolean;
    story?: Story;
}

export default function NewStoryMain(props: Props) {
    const [story, setStory] = useState<Story>({
        id: props.story?.id || uuid(),
        creator: props.profile,
        character: props.character,
        title: props.story?.title || "",
        description: props.story?.description || "",
        story: props.story?.story || "",
        first_message: props.story?.first_message || "",
        image_link: props.story?.image_link || "",
        is_private: props.story?.is_private || false,
        extra_characters_client: props.story?.extra_characters_client || [],
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
                    image_link: story.image_link,
                    is_private: story.is_private,
                    extra_characters: story.extra_characters_client?.map((char) => char.id) ?? [],
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
        setIsSaving(false);
    }

    const handleDelete = async () => {
        setIsDeleting(true);
        // Delete the Story
        try {
            await deleteStory(story.id);
            window.location.href = `/c/${story.character.id}`;
        } catch (e) {
            console.error(e);
        }
        setIsDeleting(false);        
    }

    const updateValue = (key: string, value: string | boolean | Character[] | string[]) => {
        setStory(prevValue => {
            return {
                ...prevValue,
                [key]: value
            }
        })
    }

    return (
        <>

        <CharacterCard fullWidth hasLink={false} data={props.character} />
                
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">Story Details</h2>

            <InputWithAI 
                story={story}
                profile={props.profile}
                character={props.character}
                initValue={story.title}
                setValue={(value) => updateValue("title", value)}
                label="Story Title"
                name="title"
                placeholder="The Great Adventure of the cat"
                description="Name of the Story" 
                maxLength={_STORY_MAX_LENGHT.title}
                isRequired
                buttonLabel="Generate Title"
                api="/api/author/story"
                maxRows={1}
                minRows={1}
                isInvalid={errorMessages?.title !== undefined}
                errorMessage={errorMessages?.title}
            />

            <InputWithAI 
                story={story}
                profile={props.profile}
                character={props.character}
                initValue={story.description}
                setValue={(value) => updateValue("description", value)}
                label="Story Description"
                name="description"
                placeholder="The cat is on a journey to find the lost treasure"
                description="Short Description of the Story. Will be used as a summary."
                maxLength={_STORY_MAX_LENGHT.description}
                isRequired
                buttonLabel="Generate Description"
                api="/api/author/story"
                isInvalid={errorMessages?.description !== undefined}
                errorMessage={errorMessages?.description}
            />

            <InputWithAI 
                story={story}
                profile={props.profile}
                character={props.character}
                initValue={story.story}
                setValue={(value) => updateValue("story", value)}
                label="Story"
                name="story"
                description="The Story itself. Write in Natural Language. Is used as a backstory."
                maxLength={_STORY_MAX_LENGHT.story}
                isRequired
                buttonLabel="Generate Story"
                api="/api/author/story"
                isInvalid={errorMessages?.story !== undefined}
                errorMessage={errorMessages?.story}
            />

            <InputWithAI 
                story={story}
                profile={props.profile}
                character={props.character}
                initValue={story.first_message}
                setValue={(value) => updateValue("first_message", value)}
                label="First Message"
                name="first_message"
                description="The first message in the Story Chat, like a kick-off."
                maxLength={_STORY_MAX_LENGHT.first_message}
                isRequired
                buttonLabel="Generate First Message"
                api="/api/author/story"
                isInvalid={errorMessages?.first_message !== undefined}
                errorMessage={errorMessages?.first_message}
            />

            <ImageInputWithAI
                contextFields={[story.title, story.description, story.story, story.first_message]}
                imageLink={story.image_link}
                setImageLink={(value) => updateValue("image_link", value)}
            />

            <div className="flex flex-col">
                <h3 className="text-lg font-bold">Other Characters</h3>
                <p className="text-xs dark:text-zinc-400">Add other Characters to your Story using this. For now, they won&apos;t be able to talk themselves in the Chat automatically. You&apos;ll have to force it by calling them by their name.</p>
                <div className="w-full overflow-x-auto">
                    <div className="flex flex-row items-center w-fit">
                        
                        {story.extra_characters_client?.map((char) => (
                            <CharacterAvatarButton
                                key={char + "select"} 
                                character={char} 
                                onClick={() => updateValue("extra_characters_client", story.extra_characters_client?.filter((char) => char.id !== char.id) ?? [])}
                            />
                        ))}

                        <ExtraCharacterSelect 
                            extraCharacters={story.extra_characters_client ?? []}
                            setCharacters={(chars) => updateValue("extra_characters_client", chars)} 
                        />

                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <Switch 
                    isSelected={story.is_private} 
                    onValueChange={(value) => updateValue("is_private", value)}
                >
                    Private
                </Switch>
                <p className="text-xs dark:text-zinc-400">When set to Private, the <b>Story gets encrypted and only you will be able to see and interact with it</b>. Note that it might still appear on the front page, but only you will see it. Please avoid this if possible to contribute to the Project.</p>
            </div>

            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold">Preview</h3>
                <StoryCard fullWidth data={story} hasLink={false} />
            </div>

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