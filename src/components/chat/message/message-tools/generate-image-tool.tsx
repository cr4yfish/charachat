"use client";

import { safeParseLink } from "@/lib/utils/text";
import { ToolInvocation, ToolResult } from "ai";
import equal from "fast-deep-equal";
import { MaximizeIcon } from "lucide-react";
import Image from "next/image";
import { memo } from "react";
import Zoom from 'react-medium-image-zoom'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const PureGenerateImage = ({ toolInvocation }: { toolInvocation: ToolInvocation & ToolResult<string, any, any> }) => {
    if (!toolInvocation?.result) {
        return (
            <div className="bg-red-100 dark:bg-red-800 p-2 rounded-md mb-2">
                <span className="font-semibold">Image generation failed</span>
            </div>
        );
    }

    return (
        <div className="p-2 w-full flex flex-col gap-2">
            <div className="h-[512px] max-sm:h-[300px] overflow-hidden relative rounded-3xl">
                <Zoom IconZoom={MaximizeIcon} >
                    <Image 
                        src={safeParseLink(toolInvocation.result)} 
                        alt={toolInvocation.args.prompt || "Generated Image"}
                        fill
                        className="object-cover object-center rounded-md"
                    />
                </Zoom>
            </div>
            {/* <span className="text-xs text-muted-foreground">{part.toolInvocation?.args?.prompt}</span> */}
        </div>
    )
}

export const GenerateImageTool = memo(PureGenerateImage, (prev, next) => {
    // Only re-render if the toolInvocation changes
    return prev.toolInvocation.toolCallId === next.toolInvocation.toolCallId &&
           equal(prev.toolInvocation.result, next.toolInvocation.result);
});