"use client";

import { Character } from "@/lib/db/types/character";
import { memo, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "../ui/button";
import { AlertTriangleIcon, CheckIcon, EyeOffIcon, LockIcon, SaveIcon, ShieldIcon, TrashIcon } from "lucide-react";
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
import SmallCharacterCard from "./character-card-small";
import { authorPrompts } from "@/lib/ai/prompts";

const PureAccordionSection = ({title, description, children, value, active, completed } : 
    { title: string, description: string, value: string, children: React.ReactNode[], active: boolean, completed?: boolean }) => {

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


const PureCharacterEdit = ({ character } : { character: Character }) => {
    const [internalCharacter, setInternalCharacter] = useState<Character>(character);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedSection, setSelectedSection] = useState<string>("basic");

    const handleUpdateCharacter = async () => {
        setIsSaving(true);
        const updatePromise = fetch(API_ROUTES.UPDATE_CHARACTER, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(internalCharacter),
        }).finally(() => {
            setIsSaving(false);
        });

        toast.promise(updatePromise, {
            loading: "Updating character...",
            success: "Character updated successfully!",
            error: "Failed to update character.",
        });
    }

    const handleDeleteCharacter = async () => {
        const deletePromise = fetch(API_ROUTES.DELETE_CHARACTER + character.id);
        
        toast.promise(deletePromise, {
            loading: "Deleting character...",
            success: "Character deleted successfully!",
            error: "Failed to delete character.",
        });
        deletePromise.then(() => {
            window.location.href = "/c";
        });
    }

    const handleInternalCharacterChange = (key: keyof Character, value: string | boolean) => {
        setInternalCharacter((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    const progress = useMemo(() => {
        const fields = ['name', 'description', 'personality', 'bio', 'first_message', 'scenario', 'book'];
        const filledFields = fields.filter(field => {
            const value = internalCharacter[field as keyof Character];
            return typeof value === 'string' && value.trim().length > 0;
        });
        return (filledFields.length / fields.length) * 100;
    }, [internalCharacter]);

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
                const value = internalCharacter[field as keyof Character];
                return typeof value === 'string' && value.trim().length > 0;
            });
            progress[section] = (filledFields.length / fields.length) * 100;
        }
        return progress;
    }, [internalCharacter]);

    return (
        <div className="size-full flex flex-col gap-4 px-4 overflow-y-auto max-h-screen pt-[75px] pb-24">
            
            <div className="fixed bottom-[40px] right-[40px] z-50 flex items-center">
                <Button onClick={handleUpdateCharacter}  size={"icon"} className="rounded-full size-[50px] bg-primary/75 backdrop-blur shadow-2xl" >
                    {
                        isSaving ? <Spinner /> : <SaveIcon size={20} />
                    }
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
                        link={internalCharacter.image_link ?? ""}
                        label="🖼️ Character Avatar"
                        description="Upload a profile picture for your character. This image will be displayed on the character card and in conversations."
                        onImageUpload={(link) => handleInternalCharacterChange("image_link", link)}
                    />

                    <TextareaWithCounter 
                        label="👤 Character Name"
                        value={internalCharacter.name}
                        onChange={(val) => handleInternalCharacterChange("name", val)}
                        placeholder="Enter your character's name"
                        maxLength={CHARACTER_LENGTH_LIMITS.name}
                    />
                    
                    <TextareaWithCounter 
                        label="📄 Character Description"
                        description="A brief overview of your character that appears on the character card to help users understand who they are."
                        value={internalCharacter.description}
                        onChange={(val) => handleInternalCharacterChange("description", val)}
                        placeholder="Describe your character in a few sentences"
                        maxLength={CHARACTER_LENGTH_LIMITS.description}
                        ai={{
                            prompt: authorPrompts.description(internalCharacter),
                        }}
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
                        label="💫 Personality Traits"
                        description="Describe your character's personality, mannerisms, and behavioral patterns. How do they speak and act?"
                        value={internalCharacter.personality ?? ""}
                        onChange={(val) => handleInternalCharacterChange("personality", val)}
                        placeholder="e.g., Friendly and outgoing, speaks with enthusiasm, often uses humor to lighten the mood..."
                        maxLength={CHARACTER_LENGTH_LIMITS.personality}
                        ai={{
                            prompt: authorPrompts.personality(internalCharacter),
                        }}
                    />
                    
                    <TextareaWithCounter 
                        label="📚 Character Biography"
                        description="Essential facts about your character's identity, occupation, background, and current situation."
                        value={internalCharacter.bio ?? ""}
                        onChange={(val) => handleInternalCharacterChange("bio", val)}
                        placeholder="e.g., A 25-year-old marine biologist who works at an aquarium. Originally from coastal Maine, passionate about ocean conservation..."
                        maxLength={CHARACTER_LENGTH_LIMITS.bio}
                        ai={{
                            prompt: authorPrompts.bio(internalCharacter),
                        }}
                    />
                    
                </AccordionSection>

                <AccordionSection
                    value="scenario"
                    title="🌍 3. Scenario & Lore"
                    description="Create the world and context around your character. Add rich backstory and situational details for immersive conversations."
                    active={selectedSection === "scenario"}
                    completed={groupedProgress.scenario == 100}
                >
                    <TextareaWithCounter 
                        label="💬 Opening Message"
                        description="The first message your character will send when users start a conversation. Make it engaging and true to their personality."
                        value={internalCharacter.first_message ?? ""}
                        onChange={(val) => handleInternalCharacterChange("first_message", val)}
                        placeholder="e.g., *waves enthusiastically* Hey there! I'm so excited to meet you! I just finished feeding the dolphins - want to hear about it?"
                        maxLength={CHARACTER_LENGTH_LIMITS.first_message}
                        ai={{
                            prompt: authorPrompts.firstMessage(internalCharacter),
                        }}
                    />

                    <TextareaWithCounter 
                        label="🎬 Initial Scenario"
                        description="Set the scene for conversations. Where does the interaction take place? What's the current situation?"
                        value={internalCharacter.scenario ?? ""}
                        onChange={(val) => handleInternalCharacterChange("scenario", val)}
                        placeholder="e.g., You meet at a cozy coffee shop on a rainy afternoon. The character just finished their shift and is looking for someone to chat with..."
                        maxLength={CHARACTER_LENGTH_LIMITS.scenario}
                        ai={{
                            prompt: authorPrompts.scenario(internalCharacter),
                        }}
                    />
                    
                    <TextareaWithCounter 
                        label="📖 Character Lore & Background"
                        description="Comprehensive character information: detailed backstory, relationships, memories, example dialogues, and world-building details. The more detail, the better the conversations."
                        value={internalCharacter.book ?? ""}
                        onChange={(val) => handleInternalCharacterChange("book", val)}
                        placeholder="e.g., Detailed history, family relationships, past experiences, speech patterns, favorite topics, goals, fears, memorable quotes..."
                        maxLength={CHARACTER_LENGTH_LIMITS.book}
                        ai={{
                            prompt: authorPrompts.book(internalCharacter),
                        }}
                    />
                </AccordionSection>

                <AccordionSection
                    value="privacy"
                    title="🔒 4. Privacy & Visibility"
                    description="Control who can discover and access your character. Customize visibility settings to match your preferences."
                    active={selectedSection === "privacy"}

                >
                        
                    <BetterSwitch 
                        label={<span className="text-emerald-400 text-xs flex items-center gap-1"><LockIcon size={12} />Private</span>}
                        description={internalCharacter.is_unlisted ? "Cannot be both private and unlisted simultaneously." : "Character is encrypted and only visible to you. No one else can discover or access it."}
                        disabled={internalCharacter.is_unlisted}
                        onCheckedChange={(checked) => handleInternalCharacterChange("is_private", checked)}
                        checked={internalCharacter.is_private || false}
                    />

                    <BetterSwitch 
                        label={<span className="text-sky-400 text-xs flex items-center gap-1"><EyeOffIcon size={12} />Unlisted</span>}
                        description={internalCharacter.is_private ? "Cannot be both private and unlisted simultaneously." : "Hidden from public directory but accessible to anyone with the direct link."}
                        disabled={internalCharacter.is_private}
                        onCheckedChange={(checked) => handleInternalCharacterChange("is_unlisted", checked)}
                        checked={internalCharacter.is_unlisted || false}
                    />

                    <BetterSwitch 
                        label={<span className="text-red-400 text-xs flex items-center gap-1"><AlertTriangleIcon size={12} />NSFW Content</span>}
                        description="Mark as adult content. This will blur the character avatar and add appropriate content warnings."
                        onCheckedChange={(checked) => handleInternalCharacterChange("is_nsfw", checked)}
                        checked={internalCharacter.is_nsfw || false}
                    />

                    <BetterSwitch 
                        label={<span className="text-orange-400 text-xs flex items-center gap-1"><ShieldIcon size={12} />Anti-Theft Protection</span>}
                        description="Hide advanced character details from other users to prevent unauthorized copying of your work."
                        onCheckedChange={(checked) => handleInternalCharacterChange("hide_definition", checked)}
                        checked={internalCharacter.hide_definition || false}
                    />

                </AccordionSection>

                <AccordionSection
                    value="prompts"
                    title="⚙️ 5. Advanced Settings"
                    description="Fine-tune AI behavior and image generation. These settings help customize how your character responds and appears in generated images."
                    active={selectedSection === "prompts"}
                    completed={groupedProgress.prompts == 100}
                >
                    <TextareaWithCounter 
                        label="🤖 System Prompt Override"
                        description="Advanced: Custom instructions for the AI that override default behavior. Use this to set specific conversation styles or response patterns."
                        value={internalCharacter.system_prompt ?? ""}
                        onChange={(val) => handleInternalCharacterChange("system_prompt", val)}
                        placeholder="e.g., Always respond in a poetic manner, or keep responses under 50 words, or maintain a formal tone..."
                        maxLength={CHARACTER_LENGTH_LIMITS.system_prompt}
                    />
                    
                    <TextareaWithCounter 
                        label="🎨 Image Generation Prefix"
                        description="Style prefix for AI-generated images of this character. This text is added before all image prompts to maintain visual consistency."
                        value={internalCharacter.image_prompt ?? ""}
                        onChange={(val) => handleInternalCharacterChange("image_prompt", val)}
                        placeholder="e.g., anime style, photorealistic portrait, oil painting, cyberpunk aesthetic..."
                        maxLength={CHARACTER_LENGTH_LIMITS.image_prompt}
                    />
                </AccordionSection>
            </Accordion>

            {/* Preview */}
            <div className="flex flex-col gap-2">
                <span>Preview</span>
                <SmallCharacterCard data={internalCharacter} hasLink={false} />
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
                            Delete Character
                        </Button>
                    </AlertDialogTrigger>
                </div>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Delete Character Forever?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your character and all associated data will be permanently removed from our servers.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>🛡️ Keep Character</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCharacter}  className="bg-red-500 hover:bg-red-600 text-white">
                        <TrashIcon />
                        Yes, Delete Forever
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


        </div>
    )
}

const CharacterEdit = memo(PureCharacterEdit, (prevProps, nextProps) => {
    return prevProps.character.id === nextProps.character.id;
});

export default CharacterEdit;