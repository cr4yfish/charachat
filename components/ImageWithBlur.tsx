"use client";

import { safeParseLink } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

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
}

export default function ImageWithBlur(props: Props) {
    const [isBlurred, setIsBlurred] = useState(props.is_nsfw ?? false);

    return (
        <>
        <Image 
            src={safeParseLink(props.src)}
            alt={props.alt}
            className={` transition-all object-cover ${props.className} ${props.radius ?? ""} ${isBlurred ? "filter blur-lg" : ""}`}
            fill={props.fill}
            onClick={() => setIsBlurred(!isBlurred)}
            sizes={props.sizes}
            layout={props.layout}
            width={props.width}
            height={props.height}
        />
        </>
    )
}