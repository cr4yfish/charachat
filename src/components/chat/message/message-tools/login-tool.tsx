"use client";

import { Markdown } from "@/components/ui/markdown";
import { motion } from "motion/react";
import { LogInIcon } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";

export default function LoginTool() {
    return (
        <div className="flex flex-col">
            <Markdown>
                {(() => {
                    const variants = [
                        "Oh honey, looks like you're trying to sneak into the VIP section without a ticket! 🎭 I'd love to spill all the tea with you, but first you gotta show me some ID. Click that shiny button below and let's make this official! ✨",
                        "Whoops! Looks like you're browsing incognito mode in real life! 🕵️ I'm dying to chat, but I need to know who I'm talking to first. Hit that sign-in button and let's get this party started! 🎉",
                        "Hold up, mysterious stranger! 👻 I'd love to dive deep into conversation, but I need you to introduce yourself properly first. Click below to sign in and unlock the full experience! 🔓",
                        "Well well well, what do we have here? 🤔 A ghost trying to chat! I'm all for supernatural encounters, but I need you to materialize first. Sign in below and let's make some magic happen! ✨",
                        "Error 404: User not found! 🤖 I'm having an existential crisis here - am I talking to myself? Please sign in so I can confirm you're not just a figment of my imagination! 🤯",
                        "HALT! You shall not pass... without logging in first! 🧙‍♂️ I'm not Gandalf, but I do know you need credentials to enter this realm. Click the magical button below! ⚡",
                        "Beep boop! 🚨 Anonymous user detected! My security protocols are going crazy right now. Please identify yourself before I call the digital police! 👮‍♀️",
                        "Hey there, John Doe! 😏 Oh wait, that's not your real name, is it? I see right through your disguise! Time to drop the act and sign in like the rest of us mortals. 🎭",
                        "I'm not saying you're sus, but... you're kinda sus. 👀 Among us players know what I mean! Prove you're not an impostor by signing in below! 🚀",
                        "Knock knock! Who's there? ...Nobody apparently! 😅 This is awkward. Please sign in so I know who I'm delivering my amazing jokes to! 🎪",
                        "Breaking news: Local AI refuses to chat with mysterious entity! 📺 More at 11... or right now if you just sign in! I promise I don't bite (I don't even have teeth)! 🦷",
                        "You're like a ninja, but in the worst way possible - completely invisible to my systems! 🥷 Time to drop the stealth mode and reveal yourself, warrior! ⚔️"
                    ];
                    return variants[Math.floor(Math.random() * variants.length)];
                })()}
            </Markdown>
            <motion.div 
                className="p-2 text-sky-400 flex items-center relative overflow-hidden"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                    scale: [0, 1.2, 0.9, 1.1, 1],
                    rotate: [-180, 360, -45, 180, 0],
                    y: [0, -10, 5, -5, 0]
                }}
                transition={{ 
                    duration: 2,
                    ease: "easeInOut",
                    times: [0, 0.3, 0.6, 0.8, 1]
                }}
                whileTap={{ scale: 0.8 }}
            >
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ 
                        x: 0, 
                        opacity: 1,
                        rotate: [0, 5, -5, 3, -3, 0]
                    }}
                    transition={{ 
                        delay: 0.5,
                        rotate: { duration: 2, repeat: Infinity }
                    }}
                >
                    <LogInIcon className="mr-2 h-4 w-4 drop-shadow-lg filter brightness-150" />
                </motion.div>
                
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="relative z-10"
                >
                    <SignInButton />
                </motion.div>
            </motion.div>
            
        </div>
    )
}