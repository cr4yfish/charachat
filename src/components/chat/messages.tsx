import { UIMessage } from "ai";
import { Message } from "./message";
import { memo } from "react";
import { isSameDay, isToday, isYesterday } from "@/lib/utils";
import { ShallowCharacter } from "@/types/db";

type Props = {
    messages: UIMessage[];
    shallowCharacter: ShallowCharacter;
    openImageGen: () => void;
    status: "submitted" | "streaming" | "ready" | "error";
}

const PureMessages = ({ messages, status, shallowCharacter, openImageGen }: Props) => {
    return (
        <>
        {messages.map((message, index) => {
            return (
            <div key={message.id} className="h-fit w-full relative max-w-[760px]" >
                {((index == 0) || !isSameDay(new Date(message.createdAt!), new Date(messages[index - 1]?.createdAt ?? ""))) && (
                    <div key={`${message.id}-date`} className="text-center text-sm dark:text-neutral-400 my-2">
                        { isToday(new Date(message.createdAt!)) 
                            ? "Today" :
                            isYesterday(new Date(message.createdAt!)) 
                            ? "Yesterday" :
                            new Date(message.createdAt!).toLocaleDateString()
                        }
                    </div>
                )}
                <Message
                    key={message.id} 
                    message={message} 
                    isLoading={(status === "streaming") && messages.length - 1 === index}
                    characterName={shallowCharacter.name}
                    characterImage={shallowCharacter.image_link}
                    openImageGen={openImageGen}
                />
            </div>
        )})}
        </>
    );
}

export const Messages = memo(PureMessages, (prev, next) => {
    if (prev.status !== prev.status) return false;
    if (prev.status && prev.status) return false;
    if (prev.messages.length !== next.messages.length) return false;
    if (prev.shallowCharacter.id !== next.shallowCharacter.id) return false;
    
    return true;
});