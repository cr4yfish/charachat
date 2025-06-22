"use client";

import { motion } from "motion/react"
import { Character } from "@/types/db";
import { cn } from "@/lib/utils";
import ImageWithBlur from "../image/imageWithBlur";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import {  EyeOffIcon, LockIcon, MessageCircleIcon, ShieldIcon } from "lucide-react";
import { memo, useState } from "react";

type Props = {
    data: Character,
    hasLink: boolean,
}

function PureCharacterCard(props: Props) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
        <Link href={`/c/${props.data.id}`} className="w-full" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
            >
                <Card className={cn("h-[72px] w-full overflow-hidden p-3 dark:bg-slate-800/5 border shadow-none dark:hover:bg-slate-800/30 flex flex-row items-center justify-start gap-3 transition-all", {
                    "dark:bg-slate-800/40": isHovered,
                    "dark:border-emerald-400": props.data.is_private,
                })}  >

                    <div className="relative size-[52px] rounded-lg overflow-hidden shrink-0">
                        <ImageWithBlur 
                            src={props.data.image_link}
                            alt={props.data.name ?? "avatar"}
                            width={52} height={52}
                            sizes="52px"
                            className="object-cover"
                            is_nsfw={props.data.is_nsfw}
                            aspectRatio={1/1}
                        />
                    </div>


                    <CardContent className="flex flex-col flex-1 gap-1 p-0 w-full overflow-hidden ">

                        <div className="flex flex-col">
                            <div className="flex flex-col">
                                <h3 className="font-medium m-0 text-sm truncate ">{props.data.name}</h3>
                                {/* <span className="text-xs text-neutral-600 dark:text-neutral-400">@{props.data.owner?.username}</span> */}
                            </div>
                            <p className="text-xs text-muted-foreground truncate w-[75%]">
                                {props.data.description}
                            </p>
                        </div>

                        
                        <div className="flex flex-row items-center justify-between gap-2 text-muted-foreground w-full ">
                            {((props.data.chats !== undefined) && (props.data.likes !== undefined)) &&
                            <>
                                <div className="flex items-center gap-1 text-xs">
                                    <MessageCircleIcon size={14} />
                                    <span className="text-xs" >{props.data.chats}</span>
                                </div>
                            </>
                            } 
                            <div className="flex items-center gap-1">
                                {props.data.is_private &&
                                    <div className="flex gap-1 items-center text-emerald-400">
                                        <LockIcon size={12} color="currentColor" />
                                        <span className="text-xs sr-only ">Private</span>
                                    </div>
                                }

                                {props.data.is_unlisted && 
                                    <div className="flex gap-1 items-center text-sky-400">
                                        <EyeOffIcon size={12} color="currentColor" />
                                        <span className="text-xs sr-only ">Unlisted</span>
                                    </div>
                                }
                                
                                {props.data.hide_definition && 
                                    <div className="flex gap-1 items-center text-orange-400">
                                        <ShieldIcon size={12} color="currentColor" />
                                        <span className="text-xs sr-only  ">Definition hidden</span>
                                    </div>
                                }
                            </div>
                        </div>
                            
                    </CardContent>
                </Card>
            </motion.div>
        </Link>
        </>
    )
}

const SmallCharacterCard =  memo(PureCharacterCard, (prevProps, nextProps) => {
    // Prevent re-render if the data is the same
    return prevProps.data.id === nextProps.data.id &&
        prevProps.hasLink === nextProps.hasLink;
});

export default SmallCharacterCard;