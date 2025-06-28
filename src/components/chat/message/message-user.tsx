"use client";

import { UIMessage } from "ai";
import { memo } from "react";
import { Markdown } from "@/components/ui/markdown";

const PureUserMessage = ({ message }: { message: UIMessage }) => {
    return (
        <div className="dark:bg-slate-800 rounded-3xl rounded-br-none p-3">
            {/* <Markdown>{message.content}</Markdown> */}
            {message.parts && message.parts.length > 0 && message.parts.map((part, index) => {
                if(part.type === "text") {
                    return <Markdown key={index}>{part.text}</Markdown>;
                }

                return (
                    <div key={index} className=" p-2 rounded-md mb-2">
                        <span className="font-semibold">Unknown part type: {part.type}</span>
                        <span className="text-neutral-500 dark:text-neutral-400">{JSON.stringify(part)}</span>
                    </div>
                );
            })}
        </div>
    );
}

export const UserMessage = memo(PureUserMessage, (prev, next) => {
    if( prev.message.content !== next.message.content) return false;
    if( prev.message.role !== next.message.role) return false;
    if( prev.message.id !== next.message.id) return false;
    if (JSON.stringify(prev.message?.parts) !== JSON.stringify(next.message?.parts)) return false;

    return true;
});