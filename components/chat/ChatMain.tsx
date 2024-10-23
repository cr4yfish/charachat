"use client";

import { useChat, Message as AIMessage } from "ai/react";
import { Input } from "@nextui-org/input";
import { v4 as uuidv4 } from "uuid";

import { Button } from "../utils/Button";
import Icon from "../utils/Icon";

import { Chat, Message, Profile } from "@/types/db";
import { useRef } from "react";
import { addMessage } from "@/functions/db/messages";

export default function ChatMain({ chat, initMessages, user } : { chat: Chat, initMessages: Message[], user: Profile }) {
    const { messages, input, handleInputChange, handleSubmit } = useChat({
        initialMessages: initMessages.map((m) => {
            return {
                id: m.id,
                createdAt: m.created_at,
                content: m.content,
                role: m.from_ai ? 'assistant' : 'user',
                
            } as AIMessage
        }),
        initialInput: "",
        keepLastMessageOnError: true,
        body: {
            profile: user,
            chat: chat
        },
        onFinish: async (message, options) => {
            console.log("Finished", message, options);
            if (inputRef.current) {
                inputRef.current.focus();
            }
            // add message to db
            const newMessage: Message = {
                id: uuidv4(),
                chat: chat,
                character: chat.character,
                user: user,
                from_ai: message.role === 'user',
                content: message.content,
                is_edited: false,
                is_deleted: false,
            }

            const res = await addMessage(newMessage);
            console.log(res);
        }
    });

    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <>
        <div className="h-full max-h-full overflow-y-auto">
            {messages.map(message => (
                <div key={message.id}>
                {message.role === 'user' ? 'User: ' : 'AI: '}
                {message.content}
                </div>
            ))}
        </div>
 

        <div className="absolute bottom-0 left-0 pb-12 px-8 w-full flex items-center justify-center">
            <form className="w-full" onSubmit={handleSubmit}>
                <Input 
                    placeholder="Send a message" 
                    size="lg" 
                    radius="full" 
                    value={input}
                    ref={inputRef}
                    name="prompt"
                    onChange={handleInputChange}
                    classNames={{
                        inputWrapper: "pr-1",
                    }}
                    endContent={
                        <Button type="submit" color="secondary" radius="full" isIconOnly>
                            <Icon filled>send</Icon>
                        </Button>
                    } 
                />
            </form>
        </div>
        </>
    )
}