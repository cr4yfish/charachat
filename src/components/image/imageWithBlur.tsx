"use client";

import { cn } from "@/lib/utils";
import { safeParseLink } from "@/lib/utils/text";
import Image from "next/image";
import { memo, useEffect, useState } from "react";
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

const PureImageWithBlur = (props: Props) => {
    const [isBlurred, setIsBlurred] = useState(props.is_nsfw ?? false);

    // keep the blur state in sync with the is_nsfw prop
    // this is useful when the image is loaded and the nsfw state changes
    useEffect(() => {
        if (props.is_nsfw !== undefined) {
            setIsBlurred(props.is_nsfw);
        }
    }, [props.is_nsfw]);

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

const ImageWithBlur = memo(PureImageWithBlur, (prevProps, nextProps) => {
    return prevProps.src === nextProps.src &&
        prevProps.alt === nextProps.alt &&
        prevProps.is_nsfw === nextProps.is_nsfw &&
        prevProps.className === nextProps.className &&
        prevProps.fill === nextProps.fill &&
        prevProps.sizes === nextProps.sizes &&
        prevProps.layout === nextProps.layout &&
        prevProps.width === nextProps.width &&
        prevProps.height === nextProps.height &&
        prevProps.radius === nextProps.radius &&
        prevProps.aspectRatio === nextProps.aspectRatio;
});

export default ImageWithBlur;