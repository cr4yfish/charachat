"use client";

import {  ArrowRightIcon, CheckIcon, LockIcon } from "lucide-react";
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
import { BetterSwitch } from "../ui/better-switch";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { ImageInput } from "../ui/image-input";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { useRouter } from "next/navigation";
import equal from "fast-deep-equal";
import { InputWithLabel } from "../ui/input-with-label";
import { Progress } from "../ui/progress";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { safeParseLink } from "@/lib/utils/text";
import { Persona } from "@/lib/db/types/persona";
import { clearDraftPersonaCookie, saveDraftPersonaCookie } from "@/app/p/new/actions";
import PersonaSmallCard from "./persona-small-card";

type Step = "initial" | "details" | "metadata" | "review";

const STEPS: Step[] = ["initial", "details", "metadata", "review"];
const TOTAL_STEPS = STEPS.length;

type Props = {
    initPersona?: Persona;
    small?: boolean;
    defaultOpen?: boolean;
}

const PureNewPersonaDrawer = ({ initPersona, small, defaultOpen }: Props) => {
    const [step, setStep] = useState<Step>("initial");
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();
    const [newPersona, setNewPersona] = useState<Persona>(initPersona || {} as Persona);
    const [debounedPersona] = useDebounce(newPersona, 500);
    const [open, onOpenChange] = useState(defaultOpen === true);
    const { isSignedIn } = useUser();

    // defaultOpen will be true when using importer
    useEffect(() => {
        if (defaultOpen === true) {
            onOpenChange(true);
        }
    }, [defaultOpen])

    useEffect(() => {
        if(!debounedPersona.id || debounedPersona.full_name?.length === 0) {
            return;
        }

        // check if debouncedPersona is different from the initial persona
        // only save if there are changes
        if(equal(debounedPersona, initPersona)) {
            // No changes, do not save
            setIsSaved(true);
            return;
        }

        // Save to cookie or local storage
        setIsLoading(true);
        saveDraftPersonaCookie(debounedPersona).then((wasSaved) => {
            if(wasSaved) {
                toast.success("Draft saved");
                setIsSaved(true);
            } else {
                toast.error("Failed to save draft");
                setIsSaved(false);
            }
       
        }).catch((err) => {
            console.error("Failed to save persona draft:", err);
            toast.error("Failed to save draft");
            setIsSaved(false);
        }).finally(() => {
            setIsLoading(false);
        })
    }, [debounedPersona, initPersona]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleValueChange = (field: keyof Persona, value: any) => {
        setNewPersona((prev) => ({
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
            handleCreatePersona();
        }
    }

    const handleCreatePersona = async () => {

        if(!isSignedIn) {
            toast.error("Hold up! You can't create a persona without signing in first. What are you, a ghost? 👻", {
                action: {
                    label: "Sign In",
                    onClick: () => {
                        router.push("/auth/login?redirect=/p/new");
                    },
                }
            });
            return;
        }

        setIsCreating(true);

        try {

            fetch(API_ROUTES.CREATE_PERSONA, {
                method: "POST",
                body: JSON.stringify(newPersona),
            }).then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || "Failed to create persona");
                }
                const createdPersona = await res.json() as Persona;
                if(!createdPersona || !createdPersona.id) {
                    throw new Error("Persona creation failed, no ID returned");
                }

                toast.success("Persona created successfully");

                // Clear the draft persona cookie
                clearDraftPersonaCookie();

                // Redirect to new persona page
                router.push("/c/" + newPersona.id + "/edit");


            }).catch((error) => {
                console.error("Failed to create persona:", error);
                toast.error("Failed to create persona");
            }).finally(() => {
                setIsCreating(false);
                setIsSaved(true);
            });

        } catch (error) {
            console.error("Failed to create persona:", error);
            toast.error("Failed to create persona");
        }
    }

    return (
        <>

        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>
                
                {small ? 
                <div className="flex flex-row text-violet-200/80 justify-between items-center gap-2 rounded-3xl bg-violet-800 p-4 cursor-pointer hover:bg-violet-700 transition-all duration-200">
                    <div className="flex flex-col gap-1">
                        <p className="text-xs">Continue editing your Persona</p>
                        <div className="flex items-center gap-1">
                            {newPersona.avatar_link &&
                            <div className="relative size-[24px] shrink-0 rounded-full overflow-hidden border border-violet-200/80">
                                <Image 
                                    src={safeParseLink(newPersona.avatar_link)}
                                    fill alt="" className="object-cover size-full"
                                />
                            </div>
                            }
                            <h2 className="font-bold text-white/90">{(newPersona && newPersona.full_name) ? ` ${newPersona.full_name}` : "From Scratch"}</h2>
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
                            <span className="w-full text-xl font-bold">Create Your Persona in Seconds</span>
                        </h1>
                        <p className="text-sm text-muted-foreground">Simple steps, endless possibilities</p>
                        {/* <div className="size-[64px] rounded-full overflow-hidden relative ">
                            <Image 
                                src={safeParseLink(newChar.image_link)}
                                fill alt="" className="object-cover size-full"
                            />
                        </div> */}

                        <InputWithLabel 
                            placeholder="Enter Persona name" value={newPersona.full_name || ""}
                            fullWidth className="pointer-events-none backdrop-blur" readonly
                        />
                    </div>

                    <div className="flex items-center self-end gap-1">
                        <span className="font-bold ">{(newPersona && newPersona.full_name) ? "Continue" : "Start"}</span>
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
                        {step === "details" && "This is optional but recommended to make your persona more engaging. You can add more advanced fields later."}
                        {step === "metadata" && "Configure privacy settings and visibility options for your persona."}
                        {step === "review" && "Review your persona details before saving."}

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
                        placeholder="Enter persona name"
                        value={newPersona.full_name || ""}
                        onChange={(value) => handleValueChange("full_name", value)}
                    />

                    <ImageInput
                        label="Avatar"
                        link={newPersona.avatar_link}
                        onImageUpload={(link) => handleValueChange("avatar_link", link)}
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
                        placeholder="Describe your Persona"
                        value={newPersona.description || ""}
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
                        description={"Encrypted and only visible to you."}
                        onCheckedChange={(checked) => handleValueChange("is_private", checked)}
                        checked={newPersona.is_private || false}
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
                        <PersonaSmallCard data={newPersona} hasLink={false} />

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
                                "Create Persona 🚀"
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

const NewPersonaDrawer = memo(PureNewPersonaDrawer, (prev, next) => {
    // Only re-render if the initial persona changes
    if(prev.initPersona?.id === next.initPersona?.id) return false;
    if(prev.small !== next.small) return false;
    if(prev.defaultOpen !== next.defaultOpen) return false;

    return true;
});

export default NewPersonaDrawer;