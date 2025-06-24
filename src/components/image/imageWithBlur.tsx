"use client";

import { cn } from "@/lib/utils";
import { safeParseLink } from "@/lib/utils/text";
import Image from "next/image";
import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio"

type Props = {
    src?: string | undefined;
    alt: string;
    className?: string;
    fill?: boolean;
    sizes?: string;
    is_nsfw?: boolean;
    layout?: "fill";
    width?: number;
    height?: number;
    radius?: "rounded" | "rounded-lg" | "rounded-xl" | "rounded-2xl" | "rounded-full";
    aspectRatio?: number;
}

export default function ImageWithBlur(props: Props) {
    const [isBlurred, setIsBlurred] = useState(props.is_nsfw ?? false);

    return (
        <AspectRatio ratio={props.aspectRatio} className={cn("overflow-hidden ", props.className, props.radius)} style={{ paddingBottom: "0 !important" }} >
            <Image 
                src={safeParseLink(props.src)}
                alt={props.alt}
                fill={props.fill}
                onClick={() => setIsBlurred(false)}
                sizes={props.sizes}
                layout={props.layout}
                width={props.width}
                height={props.height}
                className={cn("transition-all size-full object-cover overflow-visible", { "filter blur-lg": isBlurred } )}
            />
        </AspectRatio>
    )
}