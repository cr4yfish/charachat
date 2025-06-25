"use client";

import { memo, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "../ui/button";
import { AlertTriangleIcon, CheckIcon, LockIcon, SaveIcon, TrashIcon } from "lucide-react";
import { TextareaWithCounter } from "../ui/textarea-with-counter";
import { CHARACTER_LENGTH_LIMITS } from "@/lib/constants/lengthLimits";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { toast } from "sonner";
import { ImageInput } from "../ui/image-input";
import { BetterSwitch } from "../ui/better-switch";
import Spinner from "../ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";
import { Persona } from "@/lib/db/types/persona";
import PersonaSmallCard from "./persona-small-card";

const PureAccordionSection = ({title, description, children, value, active, completed } : 
    { title: string, description: string, value: string, children: React.ReactNode[] | React.ReactNode, active: boolean, completed?: boolean }) => {

    return (
        <AccordionItem value={value} className={cn("mb-2 rounded-xl p-2 transition-all border  ", 
        { "border-primary/15 bg-primary/2": active }, 
        { "border-emerald-700/50 bg-emerald-800/10": completed })}
        >
            <AccordionTrigger>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                       <span>{title}</span> 
                       {completed && <span className="text-emerald-400"><CheckIcon color="currentColor" size={14} /></span>}
                    </div>
                    
                    {description && <span className="text-xs text-muted-foreground/75 ml-2">{description}</span>}
                    
                </div>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 pb-4">
                
                {children}

            </AccordionContent>
        </AccordionItem>
    )
}

const AccordionSection = memo(PureAccordionSection, (prevProps, nextProps) => {
    return prevProps.title === nextProps.title && 
    prevProps.description === nextProps.description && 
    prevProps.children === nextProps.children  && 
    prevProps.value === nextProps.value &&
    prevProps.active === nextProps.active;
});


const PurePersonaEdit = ({ persona } : { persona: Persona }) => {
    const [internalPersona, setInternalPersona] = useState<Persona>(persona);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedSection, setSelectedSection] = useState<string>("basic");

    const handleUpdatePersona = async () => {
        setIsSaving(true);
        const updatePromise = fetch(API_ROUTES.UPDATE_PROFILE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(internalPersona),
        }).finally(() => {
            setIsSaving(false);
        });

        toast.promise(updatePromise, {
            loading: "Updating persona...",
            success: "Persona updated successfully!",
            error: "Failed to update persona.",
        });
    }

    const handleDeletePersona = async () => {
        const deletePromise = fetch(API_ROUTES.DELETE_PERSONA + persona.id);
        
        toast.promise(deletePromise, {
            loading: "Deleting persona...",
            success: "Persona deleted successfully!",
            error: "Failed to delete persona.",
        });
        deletePromise.then(() => {
            window.location.href = "/c";
        });
    }

    const handleInternalPersonaChange = (key: keyof Persona, value: string | boolean) => {
        setInternalPersona((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    const progress = useMemo(() => {
        const fields = ['name', 'description', 'personality', 'bio', 'first_message', 'scenario', 'book'];
        const filledFields = fields.filter(field => {
            const value = internalPersona[field as keyof Persona];
            return typeof value === 'string' && value.trim().length > 0;
        });
        return (filledFields.length / fields.length) * 100;
    }, [internalPersona]);

    const groupedProgress = useMemo(() => {
        const sections = {
            basic: ['name', 'description', 'image_link'],
            content: ['personality', 'bio'],
            scenario: ['scenario', 'book', 'first_message'],
            prompts: ["system_prompt", "image_prompt"]
        };  
        const progress: { [key: string]: number } = {};
        for (const [section, fields] of Object.entries(sections)) {
            const filledFields = fields.filter(field => {
                const value = internalPersona[field as keyof Persona];
                return typeof value === 'string' && value.trim().length > 0;
            });
            progress[section] = (filledFields.length / fields.length) * 100;
        }
        return progress;
    }, [internalPersona]);

    return (
        <div className="size-full flex flex-col gap-4 px-4 overflow-y-auto max-h-screen pt-[75px] pb-24">
            
            <div className="fixed bottom-0 left-0 z-50 flex items-center justify-center w-full p-4">
                <Button onClick={handleUpdatePersona} className="rounded-full w-full bg-primary/25 backdrop-blur shadow-2xl" >
                    {
                        isSaving ? <Spinner /> : <SaveIcon size={20} />
                    }
                    Save Persona
                </Button>
            </div>

            <div className="flexx flex-colo">
                <span className="text-xs text-muted-foreground/75">Completion {progress.toFixed(0)}%</span>
                <Progress 
                    max={100}
                    value={progress}
                />
            </div>

            <Accordion type="single" defaultValue="basic" onValueChange={setSelectedSection} collapsible className="w-full">
                <AccordionSection 
                    value="basic" 
                    title="📝 1. Basic Information" 
                    description="Essential details about your character that appear on the character card and help users identify them."
                    active={selectedSection === "basic"}
                    completed={groupedProgress.basic == 100}
                >
                        
                    <ImageInput 
                        link={internalPersona.avatar_link ?? ""}
                        label="🖼️ Character Avatar"
                        description="Upload a profile picture for your persona. This image will be displayed on the character card and in conversations."
                        onImageUpload={(link) => handleInternalPersonaChange("avatar_link", link)}
                    />

                    <TextareaWithCounter 
                        label="👤 Persona Name"
                        value={internalPersona.full_name}
                        onChange={(val) => handleInternalPersonaChange("full_name", val)}
                        placeholder="Enter your character's name"
                        maxLength={CHARACTER_LENGTH_LIMITS.name}
                    />
                    
                    <TextareaWithCounter 
                        label="📄 Persona Description"
                        description="A brief overview of your character that appears on the character card to help users understand who they are."
                        value={internalPersona.description}
                        onChange={(val) => handleInternalPersonaChange("description", val)}
                        placeholder="Describe your character in a few sentences"
                        maxLength={CHARACTER_LENGTH_LIMITS.description}
                    />

                </AccordionSection>

                <AccordionSection
                    value="content"
                    title="🎭 2. Personality & Background"
                    description="Define your character's core traits, history, and how they greet users. This shapes their conversational behavior."
                    active={selectedSection === "content"}
                    completed={groupedProgress.content == 100}
                >

                    
                    <TextareaWithCounter 
                        label="📚 Character Biography"
                        description="Essential facts about your character's identity, occupation, background, and current situation."
                        value={internalPersona.bio ?? ""}
                        onChange={(val) => handleInternalPersonaChange("bio", val)}
                        placeholder="e.g., A 25-year-old marine biologist who works at an aquarium. Originally from coastal Maine, passionate about ocean conservation..."
                        maxLength={CHARACTER_LENGTH_LIMITS.bio}
                    />
                    
                </AccordionSection>


                <AccordionSection
                    value="privacy"
                    title="🔒 4. Privacy & Visibility"
                    description="Control who can discover and access your persona. Customize visibility settings to match your preferences."
                    active={selectedSection === "privacy"}

                >
                        
                    <BetterSwitch 
                        label={<span className="text-emerald-400 text-xs flex items-center gap-1"><LockIcon size={12} />Private</span>}
                        description={"Persona is encrypted and only visible to you. No one else can discover or access it."}
                        onCheckedChange={(checked) => handleInternalPersonaChange("is_private", checked)}
                        checked={internalPersona.is_private || false}
                    />

                </AccordionSection>

            </Accordion>

            {/* Preview */}
            <div className="flex flex-col gap-2">
                <span>Preview</span>
                <PersonaSmallCard data={internalPersona} hasLink={false} />
            </div>

            {/* Danger zone */}
            <AlertDialog>
                <div className="flex flex-col gap-1 mt-4 p-3 rounded-2xl !bg-transparent border-2 border-yellow-400 border-dashed">
                    <div className="flex items-center gap-1 text-yellow-400 mb-2">
                        <AlertTriangleIcon size={14} color="currentColor" />
                       <span className="text-xs">Danger zone</span> 
                    </div>
                    
                    <AlertDialogTrigger asChild>
                        <Button variant={"destructive"} className="h-[48px] rounded-2xl">
                            <TrashIcon />
                            Delete persona
                        </Button>
                    </AlertDialogTrigger>
                </div>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Delete Persona Forever?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your persona and all associated data will be permanently removed from our servers.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>🛡️ Keep persona</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePersona}  className="bg-red-500 hover:bg-red-600 text-white">
                        <TrashIcon />
                        Yes, Delete Forever
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


        </div>
    )
}

const PersonaEdit = memo(PurePersonaEdit, (prevProps, nextProps) => {
    return prevProps.persona.id === nextProps.persona.id;
});

export default PersonaEdit;