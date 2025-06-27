"use client";

import { motion } from "motion/react"
import { cn } from "@/lib/utils";
import ImageWithBlur from "../image/imageWithBlur";
import { Card, CardContent } from "../ui/card";
import { LockIcon } from "lucide-react";
import { memo } from "react";
import equal from "fast-deep-equal";
import { Persona } from "@/lib/db/types/persona";
import { safeParseLink, truncateText } from "@/lib/utils/text";
import ConditionalLink from "../conditional-link";
import { Skeleton } from "../ui/skeleton";

type Props = {
    data: Persona,
    hasLink: boolean,
    onClick?: () => void,
}

function PurePersonaSmallCard(props: Props) {

    return (
        <>
        <ConditionalLink href={`/p/${props.data.id}`} className="w-full max-w-[560px]" active={props.hasLink} >
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                onClick={props.onClick}
            >
                <Card className={cn("h-[72px] sm:h-[90px] w-full overflow-hidden p-3 dark:bg-slate-800/5 border sm:border-none shadow-none dark:hover:bg-slate-800/30 flex flex-row items-center justify-start gap-3 transition-all", {
                    "dark:border-emerald-400": props.data.is_private,
                })}  >

                    <div className="relative size-[52px] sm:size-[90px]  rounded-lg overflow-hidden shrink-0">
                        <ImageWithBlur 
                            src={safeParseLink(props.data.avatar_link)}
                            alt={props.data.full_name ?? "avatar"}
                            width={52} height={52}
                            sizes="52px"
                            className="object-cover"
                            is_nsfw={false}
                            aspectRatio={1/1}
                        />
                    </div>

                    <CardContent className="flex flex-col flex-1 gap-1 p-0 w-full overflow-hidden ">

                        <div className="flex flex-col items-start">

                            <div className="flex flex-col items-start w-full text-start">
                                <h3 className="font-medium m-0 text-sm sm:text-lg truncate ">{props.data.full_name}</h3>
                                {(props.data.description || props.data.bio) && 
                                <p className="text-xs sm:text-sm text-muted-foreground truncate w-[75%] overflow-hidden">
                                    {truncateText(props.data.description || props.data.bio, 30) }
                                </p>
                                }                                
                            </div>
                            <span className="text-xs sm:text-sm text-muted-foreground text-start">@{props.data.creator?.username}</span>
                        </div>

                        
                        <div className="flex flex-row items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground/75 w-full ">
                            <div className="flex items-center gap-1">
                                {props.data.is_private &&
                                    <div className="flex gap-1 items-center text-emerald-400">
                                        <LockIcon size={12} color="currentColor" />
                                        <span className="text-xs sr-only ">Private</span>
                                    </div>
                                }

                            </div>
                        </div>
                            
                    </CardContent>
                </Card>
            </motion.div>
        </ConditionalLink>
        </>
    )
}

const PersonaSmallCard =  memo(PurePersonaSmallCard, (prevProps, nextProps) => {
    // Prevent re-render if the data is the same
    return equal(prevProps.data, nextProps.data) &&
        prevProps.hasLink === nextProps.hasLink;
});

export default PersonaSmallCard;

export const PersonaSmallCardSkeleton = () => {

    return (
        <Card className="h-[72px] sm:h-[90px] min-w-[245px]  w-full overflow-hidden p-3 dark:bg-slate-800/5 border sm:border-none shadow-none flex flex-row items-center justify-start gap-3">
            {/* Avatar skeleton */}
            <Skeleton className="size-[52px] sm:size-[90px] rounded-lg shrink-0 bg-primary/15" />
            
            {/* Content skeleton */}
            <div className="flex flex-col gap-1 w-[155px] overflow-hidden">
                {/* Name skeleton */}
                <Skeleton className="h-4 sm:h-[28px] w-[120px] bg-primary/15" />
                {/* Description skeleton */}
                <Skeleton className="h-3 sm:h-4 w-1/2 bg-primary/15" />
            </div>
        </Card>
    )
}