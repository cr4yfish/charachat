/**
 * Chat but smaller. Useful for being inserted on other pages.
 * 
 * Primary use if for c/[id] pages to test out characters
 * without having to go to the chat page.
 * 
 * Stuff not available in small chat:
 * - Personas
 * - Tools
 * - Custom instructions
 * - Saving conversations
 */

"use client";

import { Character } from "@/lib/db/types/character";
import { Message, useChat } from "@ai-sdk/react";
import { PromptInput } from "./prompt-input";
import { v4 as uuidv4 } from "uuid";
import { Message as MessageComponent } from "./message";
import { ScrollArea } from "../ui/scroll-area";
import { useEffect } from "react";
import { replaceVariables } from "@/lib/utils/text";
import { chatErrorHandler } from "@/lib/utils/chat-helpers";
import { Button } from "../ui/button";
import { MessageCirclePlusIcon } from "lucide-react";

type Props = {
    character: Character;
}

const PureSmallChat = ({ character }: Props) => {

    const { messages, setMessages, status, append } = useChat({
        maxSteps: 1,
        sendExtraMessageFields: true,
        body: {
            chatId: uuidv4(),
            isIntro: false,
            characterId: character.id,
            isSmallChat: true,
        },
        onError: (error) => {
            chatErrorHandler({
                error: error,
                setMessages: setMessages,
            });
        }
    })

    useEffect(() => {
        // If the character has a first message, append it to the chat
        if (character.first_message || character.intro) {

            let content = character.first_message || character.intro;

            content = replaceVariables(content, {
                "{{char}}": character.name,
            })

            const firstMessage = {
                id: uuidv4(),
                role: "assistant",
                content: content,
                createdAt: new Date(),
            } as Message

            setMessages((prevMessages) => {
                // If the last message is the first message, don't append it again
                if(prevMessages.some(msg => msg.role === "assistant" && msg.content === content)) {
                    return prevMessages;
                }

                return [firstMessage, ...prevMessages];
            });
        }
    }, [character, setMessages])

    const submitMiddleWare = (input: string) => {
        append({
            id: uuidv4(),
            role: "user",
            content: input,
            createdAt: new Date(),
        }, {
            allowEmptySubmit: false,
            body: {
                isUserMessage: true,
            }
        })
    }

    const handleNewChat = () => {
        // Reset messages to start a new chat
        setMessages([]);
    }

    return (
        // Wrapper adjusts size based on parent container
        // max-w-2xl ensures it doesn't get absurdly large
        <div id="small-chat" className="bg-background/50 backdrop-blur border border-border rounded-3xl size-full max-w-2xl relative flex flex-col gap-4 p-1" >

            <div className="absolute top-2 left-2 z-20">
                <Button onClick={handleNewChat} variant={"ghost"} className="text-muted-foreground">
                    <MessageCirclePlusIcon size={16} />
                    <span>Reset</span>
                </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="p-4 h-full flex flex-col min-h-[200px] max-h-[400px]">
                {messages.map((message) => (
                    <MessageComponent 
                        key={message.id}
                        message={message}
                        isLoading={status === "streaming" || status === "submitted"}
                        characterName={character.name}
                        characterImage={character.image_link}
                        status={status}
                        latestMessage={messages[messages.length - 1]?.id === message.id}
                        chatId={undefined} // Small chat does not have a chatId
                    />
                ))}
                <div className="pb-[70px] sm:pb-[50px]" id="endpad"></div>
            </ScrollArea>

            {/* Prompt input */}
            <PromptInput 
                submitMiddleWare={submitMiddleWare}
                isLoading={status === "streaming" || status === "submitted"}
            />

        </div>
    )
}

const SmallChat = PureSmallChat;

export default SmallChat;