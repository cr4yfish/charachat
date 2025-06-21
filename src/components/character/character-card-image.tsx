"use client";

import { Character } from "@/types/db";
import { truncateText } from "@/lib/utils";
import ImageWithBlur from "../image/imageWithBlur";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import { memo } from "react";
import { MessageCircleIcon } from "lucide-react";

type CardProps = {
    data: Character;
}

const PureImageCard = (props: CardProps) => {

    return (
        <Link href={`/c/${props.data.id}`} className="w-full overflow-visible">
                <Card className="h-[200px] w-[150px] relative py-3 border shadow-none transition-all hover:transform-3d" >
                   
                    <CardContent className="absolute z-10 bottom-0 left-0 w-full p-0 overflow-visible rounded-b-2xl">
                        <div className="flex flex-col pb-2 px-3 pt-1 z-10 relative">
                            <h3 className="font-medium text-sm truncate text-neutral-200 ">{truncateText(props.data.name, 15)}</h3>
                            <div className="flex flex-row justify-between items-center text-xs text-muted-foreground opacity-75">
                                {props.data.description && <p className=" truncate w-[80%] " >{props.data.description}</p>}
                                <span className="flex items-center gap-1 ml-0.5 ">
                                    <MessageCircleIcon size={12} /> 
                                    {props.data.chats?.toLocaleString()}
                                </span>
                            </div>
                           
                        </div>
                        {/* Background gradient */}
                        <div className="absolute rounded-2xl bottom-0 left-0 size-full h-[150%] bg-gradient-to-t from-neutral-900/75 via-neutral-900/33 to-neutral-900/0"></div>
                    </CardContent>

                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl">
                        <ImageWithBlur 
                            src={props.data.image_link}
                            alt={props.data.name ?? "avatar"}
                            fill
                            sizes="100px"
                            is_nsfw={props.data?.is_nsfw}
                            aspectRatio={3/4}
                        />
                    </div>
                </Card>
        </Link>
    )
}

export const ImageCharacterCard = memo(PureImageCard, (prevProps, nextProps) => {
    // Prevent re-render if the data is the same
    return prevProps.data.id === nextProps.data.id
});

export default ImageCharacterCard;