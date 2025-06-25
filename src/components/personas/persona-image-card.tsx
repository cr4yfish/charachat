"use client";

import { Persona } from "@/types/db";
import { cn } from "@/lib/utils";
import { truncateText } from "@/lib/utils/text";
import ImageWithBlur from "../image/imageWithBlur";
import { Card, CardContent } from "../ui/card";
import { memo } from "react";
import { LockIcon } from "lucide-react";
import ConditionalLink from "../conditional-link";

type CardProps = {
    data: Persona;
    hasLink?: boolean; // Optional prop to determine if the card should be a link
}

const PureImageCard = (props: CardProps) => {

    return (
        <ConditionalLink active={props.hasLink || true} href={`/p/${props.data.id}`} className="w-fit overflow-visible">
                <Card className={cn("h-[200px] w-[150px] relative py-3 border shadow-none transition-all", {  " border-emerald-400 ": props.data.is_private })} >
                   {props.data.is_private && (
                    <div className="absolute top-0 right-0 text-emerald-400 pt-2 pr-2 z-10 flex items-center gap-1">
                        <LockIcon size={12} color="currentColor" />
                        <span className="text-xs">Private</span>
                    </div>
                   )}
                    <CardContent className="absolute z-10 bottom-0 left-0 w-full p-0 overflow-visible rounded-b-2xl">
                        <div className="flex flex-col pb-2 px-3 pt-1 z-10 relative">
                            <h3 className="font-medium text-sm truncate text-neutral-200 ">{truncateText(props.data.full_name, 15)}</h3>
                            <div className="flex flex-row justify-between items-center text-xs text-muted-foreground opacity-75">
                                {(props.data.description || props.data.bio) && <p className=" truncate w-[80%] " >{props.data.description || props.data.bio}</p>}
                            </div>
                           
                        </div>
                        {/* Background gradient */}
                        <div className="absolute rounded-2xl bottom-0 left-0 size-full h-[150%] bg-gradient-to-t from-neutral-900/75 via-neutral-900/33 to-neutral-900/0"></div>
                    </CardContent>

                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl">
                        <ImageWithBlur 
                            src={props.data.avatar_link}
                            alt={props.data.full_name ?? "avatar"}
                            fill
                            sizes="100px"
                            is_nsfw={false}
                            aspectRatio={3/4}
                        />
                    </div>
                </Card>
        </ConditionalLink>
    )
}

export const PersonaImageCard = memo(PureImageCard, (prevProps, nextProps) => {
    // Prevent re-render if the data is the same
    return prevProps.data.id === nextProps.data.id
});

export default PersonaImageCard;