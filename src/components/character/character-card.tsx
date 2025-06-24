"use client";

import { motion } from "motion/react"
import { Character } from "@/types/db";
import { cn } from "@/lib/utils";
import { truncateText } from "@/lib/utils/text";
import ImageWithBlur from "../image/imageWithBlur";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import { HeartIcon, LockIcon, MessageCircleIcon } from "lucide-react";

import { Vibrant } from "node-vibrant/browser"
import { memo, useCallback, useEffect, useState } from "react";

type Props = {
    data: Character,
    hasLink: boolean,
    fullWidth?: boolean,
    isSmall?: boolean,
    noBg?: boolean,
    bgOverwrite?: string,
    variant?: "default" | "small" | "imageCard" 
}

function PureCharacterCard(props: Props) {

    const [vibrantColor, setVibrantColor] = useState<string | null>(null);

    const setColor = useCallback(async () => {
        if(!props.data.image_link) return;
        await Vibrant.from(props.data.image_link)
            .getPalette()
            .then((palette) => {
                if (palette.DarkMuted) {
                    setVibrantColor(palette.DarkMuted.hex);
                } else {
                    setVibrantColor(null);
                }
            })
            // to be expected, a lot of images cannot be processed by Vibrant
            .catch(() => {
                setVibrantColor(null);
            });
    }, [props.data.image_link, setVibrantColor]);

    useEffect(() => {
        if (props.data.image_link) {
            setColor();
        }
    }, [props.data.image_link, setColor]);

    return (
        <>
        <Link href={`/c/${props.data.id}`} className={`${props.fullWidth && "w-full"}`}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
            >
                <Card 
                    className={cn("h-[150px] w-[290px] py-3 dark:bg-slate-800/20 backdrop-blur-xl border dark:border-none shadow-none dark:hover:bg-slate-800/30 flex items-center justify-center transition-all" 
                    + props.bgOverwrite,
                    {
                        "w-full": props.fullWidth,
                        "bg-transparent dark:bg-transparent": props.noBg,
                    }
                    )}
                    style={{ backgroundColor: props.noBg ? "transparent" : vibrantColor ? `${vibrantColor}50` : ""}}
                    >

                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl">
                        <ImageWithBlur 
                            src={props.data.image_link}
                            alt={props.data.name ?? "avatar"}
                            fill
                            sizes="100px"
                            className="h-[150px] w-[100px]"
                            is_nsfw={props.data.is_nsfw}
                            aspectRatio={3/4}
                        />
                    </div>


                    <CardContent className=" size-full gap-1 pl-[120px] pr-3 flex flex-col items-start justify-between ">

                        <div className="flex flex-col ">
                            <div className="flex flex-col">
                                <h3 className="font-medium text-lg m-0 ">{truncateText(props.data.name,15)}</h3>
                                {/* <span className="text-xs text-neutral-600 dark:text-neutral-400">@{props.data.owner?.username}</span> */}
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {truncateText(props.data.description, 70)}
                            </p>
                        </div>

                        
                        <div className="flex flex-row items-center gap-2">
                            {((props.data.chats !== undefined) && (props.data.likes !== undefined)) &&
                            <>
                                <div className="flex items-center gap-1 text-xs dark:text-neutral-400">
                                    <MessageCircleIcon size={14} />
                                    <span className="text-xs" >{props.data.chats}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs dark:text-neutral-400">
                                    <HeartIcon size={14} />
                                    <span className="text-xs" >{props.data.likes}</span>
                                </div>
                            </>
                            } 
                            {props.data.is_private &&
                                <div className="flex gap-1 items-center text-green-500">
                                    <LockIcon color="currentColor" />
                                    <span className="text-xs">Private</span>
                                </div>
                            }
                        </div>
                            
                    </CardContent>
                </Card>
            </motion.div>
        </Link>
        </>
    )
}

const CharacterCard =  memo(PureCharacterCard, (prevProps, nextProps) => {
    // Prevent re-render if the data is the same
    return prevProps.data.id === nextProps.data.id &&
        prevProps.hasLink === nextProps.hasLink &&
        prevProps.fullWidth === nextProps.fullWidth &&
        prevProps.isSmall === nextProps.isSmall &&
        prevProps.noBg === nextProps.noBg &&
        prevProps.bgOverwrite === nextProps.bgOverwrite &&
        prevProps.variant === nextProps.variant;
});

export default CharacterCard;