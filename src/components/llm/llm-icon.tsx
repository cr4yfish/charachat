import { DeveloperIconMap, invertIcons, ProviderId } from "@/lib/ai/types";
import { cn } from "@/lib/utils";
import { safeParseLink } from "@/lib/utils/text";
import Image from "next/image";
import { memo } from "react";

type Props = {
    provider: ProviderId;
    width?: number;
}

const PureLLMIcon = ({ provider, width } : Props) => {
    if (!provider || !DeveloperIconMap.has(provider)) {
        return null; // or a default icon
    }

    return (
        <Image 
            width={width || 12}
            height={width || 12}
            alt=""
            src={safeParseLink("/images/ai_providers/" + DeveloperIconMap.get(provider) || "/images/ai_providers/openai.svg")}
            className={cn("object-fit", {
                "invert": invertIcons.includes(provider)
            })}
        />
    )
}

const LLMIcon = memo(PureLLMIcon, (prevProps, nextProps) => {
    if (prevProps.provider !== nextProps.provider) return false;
    if (prevProps.width !== nextProps.width) return false;
    return true;
});

export default LLMIcon;