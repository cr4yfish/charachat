"use client";

import { Character } from "@/lib/db/types/character";
import { cn } from "@/lib/utils";
import { safeParseLink, truncateText } from "@/lib/utils/text";
import ImageWithBlur from "../image/imageWithBlur";
import { Card, CardContent } from "../ui/card";
import { memo, useCallback, useState } from "react";
import { LockIcon, MessageCircleIcon } from "lucide-react";
import ConditionalLink from "../conditional-link";
import { motion } from "motion/react";

const extractPrimaryColor = async (imageUrl: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Small canvas for fast processing
                canvas.width = 10;
                canvas.height = 10;
                
                ctx?.drawImage(img, 0, 0, 10, 10);
                const imageData = ctx?.getImageData(0, 0, 10, 10);
                
                if (!imageData) {
                    resolve('rgba(30, 41, 59)'); // fallback
                    return;
                }

                // Sample multiple pixels and find most vibrant
                let maxSaturation = 0;
                let primaryColor = 'rgba(30, 41, 59)';
                
                for (let i = 0; i < imageData.data.length; i += 4) {
                    const r = imageData.data[i];
                    const g = imageData.data[i + 1];
                    const b = imageData.data[i + 2];
                    
                    // Calculate saturation
                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const saturation = max === 0 ? 0 : (max - min) / max;
                    
                    if (saturation > maxSaturation) {
                        maxSaturation = saturation;
                        // Darken for background use
                        primaryColor = `rgba(${Math.floor(r * 0.6)}, ${Math.floor(g * 0.6)}, ${Math.floor(b * 0.6)})`;
                    }
                }
                
                resolve(primaryColor);
            };
            img.onerror = () => resolve('rgba(30, 41, 59)');
            img.src = imageUrl;
        });
}

type CardProps = {
    data: Character;
    hasLink?: boolean; // Optional prop to determine if the card should be a link
}

const PureImageCard = (props: CardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [hoverColor, setHoverColor] = useState<string | null>(null);


    const handleMouseEnter = useCallback(async () => {
        setIsHovered(true);
        if (props.data.image_link && !hoverColor) {
            // Extract color on each hover - it's fast enough for small canvas
            const color = await extractPrimaryColor(props.data.image_link);
            setHoverColor(color);
        }
    }, [props.data.image_link, hoverColor]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    return (
        <ConditionalLink active={props.hasLink || true} href={`/c/${props.data.id}`} className="w-fit overflow-visible">
                <Card 
                    onMouseEnter={handleMouseEnter} 
                    onMouseLeave={handleMouseLeave} 
                    className={cn("h-[200px] w-[150px] relative py-3 border shadow-none transition-all", 
                        {  " border-emerald-400 ": props.data.is_private }, 
                        props.data.is_private ? "dark:bg-slate-800/20" : "dark:bg-slate-800/5", "dark:hover:bg-slate-800/30", "bg-transparent dark:bg-transparent")}
                >

                    {/* Visible on private chars */}
                   {props.data.is_private && (
                    <div className="absolute top-0 right-0 text-emerald-400 pt-2 pr-2 z-10 flex items-center gap-1">
                        <LockIcon size={12} color="currentColor" />
                        <span className="text-xs">Private</span>
                    </div>
                   )}

                    <CardContent className="absolute z-10 bottom-0 left-0 w-full p-0 overflow-visible rounded-b-2xl">
                        <div className="flex flex-col pb-2 px-3 pt-1 z-10 relative">
                            <h3 className="font-medium text-sm truncate text-neutral-200 ">{truncateText(props.data.name, 15)}</h3>
                            <div className="flex flex-row justify-between items-center text-xs text-muted-foreground opacity-75">
                                {props.data.description && <p className=" truncate w-[80%] " >{props.data.description}</p>}
                                {props.data.chats && props.data.chats > 0 && 
                                    <span className="flex items-center gap-1 ml-0.5 ">
                                        <MessageCircleIcon size={12} /> 
                                        {props.data.chats?.toLocaleString()}
                                    </span>
                                }
                            </div>
                           
                        </div>

                        {/* Background gradient */}
                        <motion.div 
                            className="absolute rounded-2xl bottom-0 left-0 size-full h-[150%] bg-gradient-to-t "
                            initial={{ height: "150%", backgroundImage: `linear-gradient(to top, 'rgba(30, 41, 59, 0.4), rgba(30, 41, 59, 0))` }}
                            animate={{ height: isHovered ? "350%" : "150%", backgroundImage: `linear-gradient(to top, ${ isHovered ? hoverColor : "rgba(30, 41, 59, 0.4)"},  rgba(30, 41, 59, 0)` }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                        </motion.div>
                   
                    </CardContent>

                    <motion.div 
                        className={cn("absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl transition-all border-transparent")}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <ImageWithBlur 
                            src={safeParseLink(props.data.image_link)}
                            alt={props.data.name ?? "avatar"}
                            fill
                            sizes="100px"
                            is_nsfw={props.data?.is_nsfw}
                            aspectRatio={3/4}
                        />
                    </motion.div >
                </Card>
        </ConditionalLink>
    )
}

export const ImageCharacterCard = memo(PureImageCard, (prevProps, nextProps) => {
    // Prevent re-render if the data is the same
    return prevProps.data.id === nextProps.data.id
});

export default ImageCharacterCard;