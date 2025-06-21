"use client";

import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TextareaWithCounter } from "../ui/textarea-with-counter";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "../ui/button";
import { Character } from "@/types/db";
import { BetterSwitch } from "../ui/better-switch";
import { clearDraftCharacterCookie, saveDraftCharacterInCookie } from "@/app/c/new/actions";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { ImageInput } from "../ui/image-input";
import { API_ROUTES } from "@/lib/apiRoutes";
import { useRouter } from "next/navigation";

type Step = "initial" | "details" | "metadata" | "review";

type Props = {
    initCharacter?: Character;
    small?: boolean;
}

const PureNewCharacterFromScratch = (props: Props) => {
    const [step, setStep] = useState<Step>("initial");
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();
    const [newChar, setNewChar] = useState<Character>(props?.initCharacter || {} as Character);
    const [debouncedChar] = useDebounce(newChar, 500);

    useEffect(() => {
        if(!debouncedChar.id || debouncedChar.name?.length === 0) {
            return;
        }

        // check if debouncedChar is different from the initial character
        // only save if there are changes
        if(debouncedChar.id === props?.initCharacter?.id &&
            debouncedChar.name === props.initCharacter.name &&
            debouncedChar.description === props.initCharacter.description &&
            debouncedChar.image_link === props.initCharacter.image_link &&
            debouncedChar.bio === props.initCharacter.bio &&
            debouncedChar.personality === props.initCharacter.personality &&
            debouncedChar.intro === props.initCharacter.intro) {
            // No changes, do not save
            setIsSaved(false);
            return;
        }

        // Save to cookie or local storage
        setIsLoading(true);
        saveDraftCharacterInCookie(debouncedChar).then((wasSaved) => {
            if(wasSaved) {
                toast.success("Draft saved");
                setIsSaved(true);
            } else {
                toast.error("Failed to save draft");
                setIsSaved(false);
            }
       
        }).catch((err) => {
            console.error("Failed to save character draft:", err);
            toast.error("Failed to save draft");
            setIsSaved(false);
        }).finally(() => {
            setIsLoading(false);
        })
    }, [debouncedChar, props]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleValueChange = (field: keyof Character, value: any) => {
        setNewChar((prev) => ({
            ...prev,
            [field]: value,
        }));

    }

    const previousStep = () => {
        if (step === "details") {
            setStep("initial");
        } 

        else if (step === "metadata") {
            setStep("details");
        }
        
        else if (step === "review") {
            setStep("metadata");
        }
    }

    const nextStep = () => {
        if (step === "initial") {
            setStep("details");
        } 

        else if (step === "metadata") {
            setStep("review");
        }
        
        else if (step === "details") {
            setStep("metadata");
        }

        else if (step === "review") {
            handleCreateCharacter();
        }
    }

    const handleCreateCharacter = async () => {
        setIsCreating(true);

        try {

            fetch(API_ROUTES.CREATE_CHARACTER, {
                method: "POST",
                body: JSON.stringify(newChar),
            }).then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || "Failed to create character");
                }
                const createdCharacter = await res.json() as Character;
                if(!createdCharacter || !createdCharacter.id) {
                    throw new Error("Character creation failed, no ID returned");
                }

                toast.success("Character created successfully");

                // Clear the draft character cookie
                clearDraftCharacterCookie();

                // Redirect to new character page
                router.push(`/c/${newChar.id}`);


            }).catch((error) => {
                console.error("Failed to create character:", error);
                toast.error("Failed to create character");
            }).finally(() => {
                setIsCreating(false);
                setIsSaved(true);
            });

        } catch (error) {
            console.error("Failed to create character:", error);
            toast.error("Failed to create character");
        }
    }

    return (
        <>

        <Drawer>
            <DrawerTrigger asChild>
                
                {props.small ? 
                <div className="flex flex-row justify-between items-center gap-2 rounded-3xl bg-neutral-800 p-4 cursor-pointer hover:bg-neutral-700 transition-all duration-200">
                    <div className="flex flex-col">
                        <p className="dark:text-muted-foreground text-xs">Continue editing</p>
                        <h2 className="font-bold">{(newChar && newChar.name) ? ` ${newChar.name}` : "From Scratch"}</h2>
                    </div>
                    
                    <div className="flex items-center self-end gap-1">
                        <ArrowRightIcon className="self-end" />
                    </div>
                </div> 
                : 
                <div className="flex flex-col gap-2 rounded-3xl bg-white text-black/90 p-4 cursor-pointer hover:bg-gray-100 transition-all duration-200">

                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold">{(newChar && newChar.name) ? "Continue" : "From Scratch"}</h2>
                        {<p className=" text-black/50">{(newChar && newChar.name) ? `Continue editing ${newChar.name}` : "Start your adventure by creating a new character"}</p>}
                    </div>
                    <div className="flex items-center self-end gap-1">
                        <span className="font-bold ">{newChar ? "Continue" : "Start"}</span>
                        <ArrowRightIcon className="self-end" />
                    </div>

                </div>
                }


            </DrawerTrigger>
            <DrawerContent className="h-screen" >
                <DrawerHeader className="flex flex-col items-start pb-0">
                    <DrawerTitle>Create a new Character</DrawerTitle>
                    <DrawerDescription className="text-start flex flex-col gap-1">
                        {step === "initial" && "Let's start by giving your character a name and description."}
                        {step === "details" && "Now, let's add more details about your character. These are optional but can help flesh out your character."}
                        {step === "metadata" && "Add some metadata to help categorize your character."}
                        {step === "review" && "Review your character details before saving."}

                        {isLoading ? <span className="text-xs">Saving...</span> : 
                            isSaved ? (
                            <span className="flex flex-row items-center gap-1 text-orange-400 text-xs ">
                                <CheckIcon size={12} />
                                <span>Draft Saved</span>
                            </span>)
                            : (<span className="text-xs text-neutral-500">Draft not saved</span>)
                        }

                    </DrawerDescription>
                </DrawerHeader>

                {step === "initial" && 
                <motion.div 
                    className="flex flex-col gap-4 p-4 overflow-y-auto"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    
                    <TextareaWithCounter
                        label="Character Name"
                        maxLength={50}
                        placeholder="Enter character name"
                        value={newChar.name || ""}
                        onChange={(value) => handleValueChange("name", value)}
                    />
                    <TextareaWithCounter
                        label="Character Description"
                        maxLength={500}
                        placeholder="Describe your character"
                        value={newChar.description || ""}
                        onChange={(value) => handleValueChange("description", value)}
                    />

                    <ImageInput
                        label="Character Avatar"
                        description="Upload an image for your character's avatar. This will be used in chats and character pages."
                        link={newChar.image_link}
                        onImageUpload={(link) => handleValueChange("image_link", link)}
                        optional
                    />

                </motion.div>
                }

                {step === "details" &&
                <motion.div 
                    className="flex flex-col gap-4 p-4 overflow-y-auto"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <TextareaWithCounter
                        label="Character Bio"
                        maxLength={1000}
                        placeholder="Enter character bio"
                        value={newChar.bio || ""}
                        onChange={(value) => handleValueChange("bio", value)}
                        optional
                    />
                    <TextareaWithCounter
                        label="Character Personality"
                        maxLength={500}
                        placeholder="Describe character personality"
                        value={newChar.personality || ""}
                        onChange={(value) => handleValueChange("personality", value)}
                        optional
                    />
                    <TextareaWithCounter
                        label="Character Intro"
                        maxLength={500}
                        placeholder="Enter character intro"
                        value={newChar.intro || ""}
                        onChange={(value) => handleValueChange("intro", value)}
                        optional
                    />
                </motion.div>
                }

                {step === "metadata" &&
                <motion.div 
                    className="flex flex-col gap-4 p-4 overflow-y-auto"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <BetterSwitch 
                        label="Private"
                        description="The Character gets encrypted and only you will be able to see and interact with it."
                        optional
                    />

                    <BetterSwitch 
                        label="NSFW"
                        description="This will blur the Avatar."
                        optional
                        onCheckedChange={(checked) => handleValueChange("is_nsfw", checked ? true : false)}
                        checked={newChar.is_nsfw || false}
                    />

                    <BetterSwitch 
                        label="Unlisted"
                        description="The character won't appear on the homepage or in searches. Good for sharing Characters with others without making them easily accesible. Don't set it to private as well, others won't be able to access it then."
                        optional
                    />

                    <BetterSwitch 
                        label="Hide Definition"
                        description="All optional and advanced fields will be hidden from the Character page. People might still be able to access them in a Chat with prompt engineering."
                        optional
                    />


                </motion.div>
                }

                {step === "review" &&
                    <>
                    <motion.div
                        className="flex flex-col gap-4 p-4 overflow-y-auto"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="flex flex-col">
                            <h3 className="text-lg font-bold">Character Overview</h3>
                            <p className="text-sm text-muted-foreground ">Review the details of your character before saving.</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h4 className="font-semibold">Name:</h4>
                            <p>{newChar.name}</p>
                        </div>

                        {newChar.description && <div className="flex flex-col gap-2">
                            <h4 className="font-semibold">Description:</h4>
                            <p>{newChar.description || "No description provided"}</p>
                        </div>}

                        {newChar.book && <div className="flex flex-col gap-2">
                            <h4 className="font-semibold">Bio:</h4>
                            <p>{newChar.bio || "No bio provided"}</p>
                        </div>}

                        {newChar.personality && <div className="flex flex-col gap-2">
                            <h4 className="font-semibold">Personality:</h4>
                            <p>{newChar.personality || "No personality provided"}</p>
                        </div>}

                        {newChar.intro && <div className="flex flex-col gap-2">
                            <h4 className="font-semibold">Intro:</h4>
                            <p>{newChar.intro || "No intro provided"}</p>
                        </div>}
                    </motion.div>
                    </>
                }

                <DrawerFooter className="flex flex-row items-center px-4 w-full">
                    <AnimatePresence mode="wait">
                        {step !== "initial" && (
                            <motion.div 
                                key="backbtn" 
                                initial={{ opacity: 0, x: -20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.15 }}
                                layout
                            >
                                <Button onClick={previousStep} variant={"ghost"} className="w-fit">
                                    Back
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div 
                        className="flex-1 flex justify-end"
                        layout
                        transition={{ duration: 0.15 }}
                    >
                        <Button disabled={isCreating} className="transition-all" onClick={nextStep}>
                            <span className="text-lg font-bold">
                                {
                                step === "initial" ? "Add Details" : 
                                step === "details" ? "Add Metadata" : 
                                step === "metadata" ? "Review" :
                                "Create Character 🚀"
                                }
                            </span>
                        </Button>
                    </motion.div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
        </>
    )
}

const NewCharacterFromScratch = memo(PureNewCharacterFromScratch, (prevProps, nextProps) => {
    // Only re-render if the initial character changes
    return prevProps.initCharacter?.id === nextProps.initCharacter?.id;
});

export default NewCharacterFromScratch;