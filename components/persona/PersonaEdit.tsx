"use client";

import { v4 as uuid } from "uuid";
import { Persona } from "@/types/db";
import { Button } from "@/components/utils/Button";
import { FormEvent, useState } from "react";
import { personaSchema } from "@/lib/schemas";
import SaveDeleteButton from "../utils/SaveDeleteButton";
import Icon from "../utils/Icon";
import ImageInputWithAI from "../ImageInputWithAI";
import { Switch } from "@nextui-org/switch";
import { createPersona, deletePersona } from "@/functions/db/personas";
import PersonaCard from "./PersonaCard";
import { useToast } from "@/hooks/use-toast";
import TextareaWithCounter from "../utils/TextareaWithCounter";


type Props = {
    persona: Persona;
    editMode?: boolean;
}

export default function PersonaEdit(props: Props) {
    const [persona, setPersona] = useState<Persona>({
        id: props.persona?.id || uuid(),
        creator: props.persona.creator,
        full_name: props.persona?.full_name || "",
        bio: props.persona?.bio || "",
        avatar_link: props.persona?.avatar_link || "",
        is_private: props.persona?.is_private || false,
    })
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Validate the Story
            const fullNameResult = personaSchema.shape.fullName.safeParse(persona.full_name);
            const bioResult = personaSchema.shape.bio.safeParse(persona.bio);
            const avatarLinkResult = personaSchema.shape.avatarLink.safeParse(persona.avatar_link);

            if(fullNameResult.success && bioResult.success && avatarLinkResult.success) {
                // Submit the Story
                await createPersona({
                    id: persona.id,
                    creator: props.persona.creator,
                    full_name: persona.full_name,
                    bio: persona.bio,
                    avatar_link: persona.avatar_link,
                    is_private: persona.is_private,
                });

                setIsSaved(true);
                if(!props.editMode) {
                    window.location.href = `/persona/${persona.id}`;
                } else {
                    setIsSaving(false);
                    toast({
                        title: "Success",
                        description: "Persona saved successfully",
                        variant: "success"
                    })
                }
            } else {
                throw new Error("Validation failed");
            }
        } catch (error) {
            console.error(error);
            setIsSaved(false);
            toast({
                title: "Error",
                description: "Failed to save the Persona",
                variant: "destructive"
            })
        }
        setIsSaving(false);
    }

    const handleDelete = async () => {
        setIsDeleting(true);
        // Delete the Story
        try {
            await deletePersona(persona.id);
            window.location.href = `/user/${props.persona.creator}/personas`;
        } catch (e) {
            console.error(e);
        }
        setIsDeleting(false);        
    }

    const updateValue = (key: string, value: string | boolean) => {
        setPersona(prevValue => {
            return {
                ...prevValue,
                [key]: value
            }
        })
    }

    return (
        <>
                
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">Persona Details</h2>

            <TextareaWithCounter 
                label="Full name"
                isRequired
                value={persona.full_name}
                onValueChange={(value) => updateValue("full_name", value)}
                maxLength={100}
            />

            <TextareaWithCounter 
                label="Bio"
                value={persona.bio}
                onValueChange={(value) => updateValue("bio", value)}
                maxLength={2000}
            />

            <ImageInputWithAI
                persona={persona}
                setImageLink={(value) => updateValue("avatar_link", value)}
            />

            <div className="flex flex-col gap-1">
                <Switch 
                    isSelected={persona.is_private} 
                    onValueChange={(value) => updateValue("is_private", value)}
                >
                    Private
                </Switch>
                <p className="text-xs dark:text-zinc-400">When set to Private, the <b>Persona gets encrypted and only you will be able to see and interact with it</b>. Note that it might still appear on the front page, but only you will see it. Please avoid this if possible to contribute to the Project.</p>
            </div>

            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold">Preview</h3>
                <PersonaCard fullWidth data={persona} hasLink={false} />
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
                {!props.editMode && (isSaved ? "Redirecting" : "Create Persona")}
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