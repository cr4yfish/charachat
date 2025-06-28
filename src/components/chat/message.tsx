import { UIMessage } from "ai";
import { memo, useMemo } from "react";
import { Markdown } from "../ui/markdown";
import { _INTRO_MESSAGE_PLACEHOLDER } from "@/lib/constants/defaults";
import equal from 'fast-deep-equal';
import { cn } from "@/lib/utils";
import { AIMessage } from "./message/message-ai";
import { Footer } from "./message/message-footer";


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

const UserMessage = memo(PureUserMessage, (prev, next) => {
    if( prev.message.content !== next.message.content) return false;
    if( prev.message.role !== next.message.role) return false;
    if( prev.message.id !== next.message.id) return false;
    if (JSON.stringify(prev.message?.parts) !== JSON.stringify(next.message?.parts)) return false;

    return true;
});

type MessageProps = {
    message: UIMessage;
    isLoading: boolean;
    characterName?: string;
    characterImage?: string;
    openImageGen?: () => void;
    deleteCallback?: (messageId: string) => void;
    chatId?: string;
    status: "submitted" | "streaming" | "ready" | "error";
    latestMessage: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addToolResult?: ({ toolCallId, result, }: { toolCallId: string; result: any; }) => void
}

const PureMessage = (props: MessageProps) => {

    const showLoading = useMemo(() => {
        return props.isLoading && props.message.role === "assistant" && props.status === "streaming";
    }, [props.isLoading, props.message.role, props.status]);

    if(props.message.content === _INTRO_MESSAGE_PLACEHOLDER) {
        return null; // don't render the intro message
    }

    return (
        <div id={props.message.id} className={cn("w-full overflow-hidden flex flex-col pb-4 relative", {
            "items-end": props.message.role === "user",
        })}>
            {props.message.role === "user" ? 
                (
                    <UserMessage message={props.message} />
                ) 
                : (
                    <AIMessage 
                        message={props.message} 
                        name={props.characterName} 
                        image={props.characterImage} 
                        isLoading={props.isLoading}
                        addToolResult={props.addToolResult}
                    />
                )
            }

            {showLoading && false &&
                <div className="flex items-center gap-2 mt-2">
                    <div className="size-3 border border-sky-200/50 shadow shadow-sky-200 bg-gradient-to-r from-transparent to-sky-200/50 rounded-full animate-spin"></div>
                    <span className="text-xs text-neutral-500 dark:text-sky-200/50">Generating response...</span>
                </div>  
            }

            {showLoading && <div className="absolute bottom-0 left-0 w-full h-[75%] bg-gradient-to-t from-background to-transparent z-10 pointer-events-none">

            </div>}


            {!showLoading && 
                <Footer 
                    message={props.message} 
                    chatId={props.chatId} 
                    openImageGen={props.openImageGen} 
                    deleteCallback={props.deleteCallback} 
                />
            }
        </div>
    )


}

export const Message = memo(PureMessage, (prev, next) => {
    if( prev.isLoading !== prev.isLoading) return false;
    if( prev.message.content !== next.message.content) return false;
    if( !equal(prev.message?.parts, next.message?.parts)) return false;
    if( prev.characterName !== next.characterName) return false;
    if( prev.characterImage !== next.characterImage) return false;
    if (prev.status !== next.status) return false;
    if (prev.addToolResult !== next.addToolResult) return false;
    
    return true;

}); 