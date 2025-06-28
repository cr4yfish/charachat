"use client";


import { UIMessage } from "ai";
import { memo} from "react";
import { CheckIcon } from "lucide-react";
import { _INTRO_MESSAGE_PLACEHOLDER } from "@/lib/constants/defaults";
import { TOOL_NAMES } from "@/lib/constants/toolNames";
import equal from 'fast-deep-equal';
import { cn } from "@/lib/utils";
import { Character } from "@/lib/db/types/character";
import { GenerateImageTool } from "./message-tools/generate-image-tool";
import { Header } from "./message-header";
import { Markdown } from "@/components/ui/markdown";
import { ReasoningBlock } from "../reasoning-block";
import LoginTool from "./message-tools/login-tool";
import ImageCharacterCard from "@/components/character/character-card-image";
import APIKeyInput from "@/components/settings/api-key-input";
import { Button } from "@/components/ui/button";
import LLMSelect from "../llm-select";


const PureAIContent = ({ message: { parts}, addToolResult }: { message: UIMessage, addToolResult?: ({ toolCallId, result, }: {
    toolCallId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any;
}) => void }) => {


    if (!parts || parts.length === 0) {
        return null; // No content to render
    }

    return (
        <>
        {parts.map((part, index: number) => {
            if(part.type === "step-start") {
                return null; // Skip step-start parts
            }

            if (part.type === "text") {
                return (
                    <div key={part.text} >
                        <Markdown key={index}>{part.text}</Markdown>
                    </div>
                );
            }

            if (part.type === "reasoning") {
                return (
                    <ReasoningBlock key={index}>
                        {part.details.map((detail) => detail.type === "text" ? detail.text : null)}
                    </ReasoningBlock>
                );
            }

            if(part.type === "tool-invocation") {
                const callId = part.toolInvocation?.toolCallId;

                switch(part.toolInvocation?.toolName) {
                    case TOOL_NAMES.addMemory:
                        switch(part.toolInvocation?.state) {
                            case "partial-call":
                                return (
                                    <div key={callId} className="bg-yellow-100 dark:bg-yellow-800 p-2 rounded-md mb-2">
                                        <span className="font-semibold">Adding memory...</span>
                                        <span className="text-neutral-500 dark:text-neutral-400">{part.toolInvocation?.args?.memory}</span>
                                    </div>
                                )
                            case "call":
                                return (
                                    <div key={callId}>
                                        <span>{part.toolInvocation?.args.memory}</span>
                                        <span className="text-neutral-500 dark:text-neutral-400">Adding memory...</span>
                                    </div>
                                )
                            case "result":
                                return (
                                    <div key={callId} className="bg-green-100 dark:bg-green-800 p-2 rounded-md mb-2">
                                        <span className="font-semibold">Memory added successfully!</span>
                                    </div>
                                )
                        }

                    case TOOL_NAMES.generateImage:
                    case "image-gen":
                        switch(part.toolInvocation?.state) {
                            case "result":
                                return GenerateImageTool({ toolInvocation: part.toolInvocation });
                        }

                    case TOOL_NAMES.login: {
                        return (
                            <LoginTool key={callId} />
                        )
                    }

                    case TOOL_NAMES.searchChars: {
                        switch(part.toolInvocation?.state) {
                            case "partial-call":
                                return (
                                    <div key={callId} className="bg-yellow-100 dark:bg-yellow-800 p-2 rounded-md mb-2">
                                        <span className="font-semibold">Searching characters...</span>
                                        <span className="text-neutral-500 dark:text-neutral-400">{part.toolInvocation?.args?.query}</span>
                                    </div>
                                )
                            case "call":
                                return (
                                    <div key={callId}>
                                        <span>{part.toolInvocation?.args.query}</span>
                                        <span className="text-neutral-500 dark:text-neutral-400">Searching characters...</span>
                                    </div>
                                )

                            case "result":
                                if (!part.toolInvocation?.result) {
                                    return (
                                        <div key={callId} className="bg-red-100 dark:bg-red-800 p-2 rounded-md mb-2">
                                            <span className="font-semibold">Character search failed</span>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={callId} className="p-2 w-full flex flex-col gap-2">
                                        <span className="font-semibold">Found {part.toolInvocation.result.length} characters:</span>
                                        <ul className="flex flex-row overflow-x-auto w-full gap-2">
                                            {part.toolInvocation.result.map((character: Character) => (
                                                <ImageCharacterCard data={character} key={character.id} />
                                            ))}
                                        </ul>
                                    </div>
                                )
                        }
                    }

                    case TOOL_NAMES.manageProviderTokens: {

                        const callback = () => {
                            if(!addToolResult) return;

                            if(!part.toolInvocation.toolCallId) {
                                throw new Error("Tool invocation does not have a toolCallId")
                            }
                            addToolResult({
                                toolCallId: part.toolInvocation.toolCallId,
                                result: "done"
                            })
                        }

                        const isDone = part.toolInvocation?.state === "result";

                        switch(part.toolInvocation?.state) {
                            case "partial-call":
                            case "call":
                            case "result":
                                return (
                                    <div key={callId} className="flex flex-col gap-4">
                                        <span className="text-xs text-muted-foreground mb-2">Manage your {part.toolInvocation?.args?.provider} API Key</span>
                                        <APIKeyInput providerId={part.toolInvocation?.args?.provider} />
                                        <div className="flex w-fit"> 
                                            <Button disabled={isDone} variant={"secondary"} className={cn("", { "bg-emerald-400": isDone })} onClick={callback}>
                                                {isDone && <span><CheckIcon /></span>}
                                                Done
                                            </Button>
                                        </div> 
                                    </div>
                                )

                        }
                    }

                    case TOOL_NAMES.chooseModel: {
                        return (
                            <div id={callId} key={callId} className="max-w-lg">
                                <LLMSelect 
                                    label="You need to select a model to continue"
                                    description="Please select a model to use for this chat. You can change it later in the settings."
                                    showLink isLoading={false} selectedKey={undefined}
                                />
                            </div>
                        )
                    }

                    default:
                        return (   
                            <div key={`unhandled-${index}-${callId}-${part.toolInvocation.toolName}`} className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md mb-2">
                                <span className="font-semibold">Unhandled Tool invocation: {part.toolInvocation?.toolName}</span>
                                <span className="text-neutral-500 dark:text-neutral-400">{JSON.stringify(part.toolInvocation)}</span>
                            </div>
                        );
                }
            }

            return (
                <div key={index} className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md mb-2">
                    <span className="font-semibold">Unknown part type: {part.type}</span>
                    <span className="text-neutral-500 dark:text-neutral-400">{JSON.stringify(part)}</span>
                </div>
            );
            
        })}


        </>
    )

}

const AIContent = memo(PureAIContent, (prev, next) => {
    if (prev.message.id !== next.message.id) return false;
    if (prev.message?.parts.length !== next.message?.parts.length) return false;
    if (JSON.stringify(prev.message?.parts) !== JSON.stringify(next.message?.parts)) return false;
    if( prev.message.content !== next.message.content) return false;
    if (JSON.stringify(prev.message.toolInvocations) !== JSON.stringify(next.message.toolInvocations)) return false;
    return false;
});

const PureAIMessage = ({ message, name, image, addToolResult }: 
    { message: UIMessage, name?: string, image?: string, isLoading: boolean, addToolResult?: ({ toolCallId, result, }: {
    toolCallId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any;
}) => void }) => {

    return (
        <div className="flex flex-col gap-2 p-1">

            <Header image={image} name={name} role={message.role} />

            <AIContent message={message} addToolResult={addToolResult} />
        </div>
    );
}

export const AIMessage = memo(PureAIMessage, (prev, next) => {
    if( !equal(prev.message?.parts, next.message?.parts)) return false;
    if( prev.message.role !== next.message.role) return false;
    if( prev.message.id !== next.message.id) return false;
    if( prev.name !== next.name) return false;
    if( prev.image !== next.image) return false;
    if( prev.addToolResult !== next.addToolResult) return false;

    return true;
});