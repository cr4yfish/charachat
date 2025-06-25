"use client";

import { AlertTriangleIcon, ArrowRightIcon, CheckIcon, EyeOffIcon, LockIcon, ShieldIcon } from "lucide-react";
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
import { Character } from "@/lib/db/types/character";
import { BetterSwitch } from "../ui/better-switch";
import { clearDraftCharacterCookie, saveDraftCharacterInCookie } from "@/app/c/new/actions";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { ImageInput } from "../ui/image-input";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { useRouter } from "next/navigation";
import equal from "fast-deep-equal";
import { InputWithLabel } from "../ui/input-with-label";
import SmallCharacterCard from "../character/character-card-small";
import { Progress } from "../ui/progress";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { safeParseLink } from "@/lib/utils/text";

type Step = "initial" | "details" | "metadata" | "review";

const STEPS: Step[] = ["initial", "details", "metadata", "review"];
const TOTAL_STEPS = STEPS.length;

type Props = {
    initCharacter?: Character;
    small?: boolean;
    defaultOpen?: boolean;
}

const PureNewCharacterFromScratch = ({ initCharacter, small, defaultOpen }: Props) => {
    const [step, setStep] = useState<Step>("initial");
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();
    const [newChar, setNewChar] = useState<Character>(initCharacter || {} as Character);
    const [debouncedChar] = useDebounce(newChar, 500);
    const [open, onOpenChange] = useState(defaultOpen === true);
    const { isSignedIn } = useUser();

    // defaultOpen will be true when using importer
    useEffect(() => {
        if (defaultOpen === true) {
            onOpenChange(true);
        }
    }, [defaultOpen])

    useEffect(() => {
        if(!debouncedChar.id || debouncedChar.name?.length === 0) {
            return;
        }

        // check if debouncedChar is different from the initial character
        // only save if there are changes
        if(equal(debouncedChar, initCharacter)) {
            // No changes, do not save
            setIsSaved(true);
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
    }, [debouncedChar, initCharacter]);

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

        if(!isSignedIn) {
            toast.error("Hold up! You can't create a character without signing in first. What are you, a ghost? 👻", {
                action: {
                    label: "Sign In",
                    onClick: () => {
                        router.push("/auth/login?redirect=/c/new");
                    },
                }
            });
            return;
        }

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
                router.push("/c/" + newChar.id +  "/edit");


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

        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>
                
                {small ? 
                <div className="flex flex-row text-violet-200/80 justify-between items-center gap-2 rounded-3xl bg-violet-800 p-4 cursor-pointer hover:bg-violet-700 transition-all duration-200">
                    <div className="flex flex-col gap-1">
                        <p className="text-xs">Continue editing your Character</p>
                        <div className="flex items-center gap-1">
                            {newChar.image_link &&
                            <div className="relative size-[24px] shrink-0 rounded-full overflow-hidden border border-violet-200/80">
                                <Image 
                                    src={safeParseLink(newChar.image_link)}
                                    fill alt="" className="object-cover size-full"
                                />
                            </div>
                            }
                            <h2 className="font-bold text-white/90">{(newChar && newChar.name) ? ` ${newChar.name}` : "From Scratch"}</h2>
                        </div> 
                       
                    </div>
                    
                    <div className="flex items-center self-end gap-1">
                        <ArrowRightIcon color="currentColor" className="self-end" />
                    </div>
                </div> 
                : 
                <div className="flex flex-col gap-2 rounded-3xl bg-transparent text-white/90 p-4 cursor-pointer transition-all duration-200 z-20">


                    <div className="flex flex-col items-center justify-center gap-2 w-full">

                        <h1 className="text-center">
                            <span className="w-full text-xl font-bold">Create Your Character in Seconds</span>
                        </h1>
                        <p className="text-sm text-muted-foreground">Simple steps, endless possibilities</p>
                        {/* <div className="size-[64px] rounded-full overflow-hidden relative ">
                            <Image 
                                src={safeParseLink(newChar.image_link)}
                                fill alt="" className="object-cover size-full"
                            />
                        </div> */}

                        <InputWithLabel 
                            placeholder="Enter character name" value={newChar.name || ""}
                            fullWidth className="pointer-events-none backdrop-blur" readonly
                        />
                    </div>

                    <div className="flex items-center self-end gap-1">
                        <span className="font-bold ">{(newChar && newChar.name) ? "Continue" : "Start"}</span>
                        <ArrowRightIcon className="self-end" />
                    </div>

                </div>
                }


            </DrawerTrigger>
            <DrawerContent className="h-screen !max-h-screen" >
                <DrawerHeader className="flex flex-col items-start pb-0">
                    <DrawerTitle>
                        {step === "initial" && "Name and Avatar"}
                        {step === "details" && "Details"}
                        {step === "metadata" && "Metadata"}
                        {step === "review" && "Review"}
                    </DrawerTitle>
                    <DrawerDescription className="text-start flex flex-col gap-1">
                        {step === "initial" && "Your draft will be automatically saved as you work."}
                        {step === "details" && "This is optional but recommended to make your character more engaging. You can add more advanced fields later."}
                        {step === "metadata" && "Configure privacy settings and visibility options for your character."}
                        {step === "review" && "Review your character details before saving."}

                        {isLoading ? <span className="text-xs">Saving...</span> : 
                            isSaved ? (
                            <span className="flex flex-row items-center gap-1 text-emerald-400 text-xs ">
                                <CheckIcon size={12} />
                                <span>Draft Saved</span>
                            </span>)
                            : (<span className="text-xs text-slate-500">Draft not saved</span>)
                        }

  
                    </DrawerDescription>

                        <div className="flex items-center gap-2 w-full">
                            <Progress 
                                value={
                                    (STEPS.indexOf(step) + 1) * 100 / STEPS.length
                                } 
                                max={STEPS.length * 100} 
                                color="emerald-400"
                            /> 
                            <span className="text-xs text-muted-foreground mt-1 shrink-0 flex items-center">
                                {STEPS.indexOf(step) + 1}/{TOTAL_STEPS}
                            </span>
                        </div>
   

                </DrawerHeader>

                {step === "initial" && 
                <motion.div 
                    className="flex flex-col gap-4 p-4 overflow-y-auto"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    
                    <TextareaWithCounter
                        label="Name"
                        maxLength={50}
                        placeholder="Enter character name"
                        value={newChar.name || ""}
                        onChange={(value) => handleValueChange("name", value)}
                    />

                    <ImageInput
                        label="Avatar"
                        link={newChar.image_link}
                        onImageUpload={(link) => handleValueChange("image_link", link)}
                        optional
                    />

                </motion.div>
                }

                {step === "details" &&
                <motion.div 
                    className="flex flex-col gap-4 p-4 overflow-y-auto h-full"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <TextareaWithCounter
                        label="Description"
                        maxLength={500}
                        rows={40}
                        height={400}
                        placeholder="Describe your character"
                        value={newChar.description || ""}
                        onChange={(value) => handleValueChange("description", value)}
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
                        label={<span className="text-emerald-400 text-xs flex items-center gap-1"><LockIcon size={12} />Private</span>}
                        description={newChar.is_unlisted ? "Cannot be private and unlisted." : "Encrypted and only visible to you."}
                        disabled={newChar.is_unlisted}
                        onCheckedChange={(checked) => handleValueChange("is_private", checked)}
                        checked={newChar.is_private || false}
                    />

                    <BetterSwitch 
                        label={<span className="text-sky-400 text-xs flex items-center gap-1"><EyeOffIcon size={12} />Unlisted</span>}
                        description={newChar.is_private ? "Cannot be private and unlisted." : "Hidden from directory, accessible via link."}
                        disabled={newChar.is_private}
                        onCheckedChange={(checked) => handleValueChange("is_unlisted", checked)}
                        checked={newChar.is_unlisted || false}
                    />

                    <BetterSwitch 
                        label={<span className="text-red-400 text-xs flex items-center gap-1"><AlertTriangleIcon size={12} />NSFW</span>}
                        description="Blurs avatar for sensitive content."
                        onCheckedChange={(checked) => handleValueChange("is_nsfw", checked)}
                        checked={newChar.is_nsfw || false}
                    />

                    <BetterSwitch 
                        label={<span className="text-orange-400 text-xs flex items-center gap-1"><ShieldIcon size={12} />Theft protection</span>}
                        description="Hides advanced fields to prevent copying."
                        onCheckedChange={(checked) => handleValueChange("hide_definition", checked)}
                        checked={newChar.hide_definition || false}
                    />
                </motion.div>
                }

                {step === "review" &&
                    <>
                    <motion.div
                        className="flex flex-col gap-4 p-4 overflow-y-auto overflow-x-hidden"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <SmallCharacterCard data={newChar} hasLink={false} />

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

const NewCharacterFromScratch = memo(PureNewCharacterFromScratch, (prev, next) => {
    // Only re-render if the initial character changes
    if(prev.initCharacter?.id === next.initCharacter?.id) return false;
    if(prev.small !== next.small) return false;
    if(prev.defaultOpen !== next.defaultOpen) return false;

    return true;
});

export default NewCharacterFromScratch;