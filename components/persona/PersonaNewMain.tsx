"use client";

import { AnimatePresence, motion } from "motion/react";
import { Button } from "../utils/Button";
import { fadeInFromBottom, fadeOutToTop } from "@/lib/animations";
import { useState } from "react";
import { Persona, Profile } from "@/types/db";
import Icon from "../utils/Icon";
import PersonaImport from "./PersonaImport";
import PersonaEdit from "./PersonaEdit";
import { v4 as uuid } from "uuid";

type Props = {
    profile: Profile
}

export default function PersonaNewMain(props: Props) {
    
    // Steps
    // 0 - Decide
    // 1 - Import
    // 2 - Main
    const [step, setStep] = useState(0);
    const [initPersona, setInitPersona] = useState<Persona>({
        id: uuid(),
        creator: props.profile,
        full_name: "",
        is_private: false,
    });
    

    const setImportedPersona = (persona: Persona) => {
        setInitPersona(persona);
        setStep(2);
    }

    return (
        <>
        <div className="w-full h-full flex flex-col gap-4">
            <div>
                {<Button isDisabled={step == 0} onClick={() => setStep(0)} variant="light"><Icon filled>arrow_back</Icon>Back</Button>}
            </div>
            
           
            <AnimatePresence>
                {step == 0 &&
                <motion.div layout
                    {...fadeOutToTop}
                    className="w-full min-h-full flex flex-col gap-4 items-start max-md:items-center justify-center"
                >
                    
                    <motion.h1 {...fadeInFromBottom} className="text-xl">Would you like to start from scratch or import from a 3rd party?</motion.h1>
                    <motion.div {...fadeInFromBottom} className="flex items-center max-md:flex-col justify-center gap-4">
                        <Button 
                            color="primary" 
                            onClick={() => setStep(2)}>Start from scratch</Button>
                        <Button isDisabled color="secondary" onClick={() => setStep(1)}>Import from 3rd party</Button>
                    </motion.div>
                
                </motion.div>
                }

                {step == 1 && 
                    <motion.div
                        
                        className="w-full min-h-full flex flex-col gap-4 items-start max-md:items-center justify-center"
                    >
                        <motion.div {...fadeInFromBottom} className="w-full h-full">
                            <PersonaImport 
                                profile={props.profile} 
                                persona={initPersona} 
                                setPersona={setImportedPersona} 
                            />
                        </motion.div>
                    </motion.div>
                }

                 {step == 2 && <PersonaEdit editMode={false} persona={initPersona} />}

            </AnimatePresence>

        </div>
        </>
    )
}