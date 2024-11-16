"use client";

import { useChat, Message as AIMessage } from "ai/react";

import TextareaWithCounter from "../utils/TextareaWithCounter";
import { Button } from "../utils/Button";
import Icon from "../utils/Icon";
import { Character, Profile, Story } from "@/types/db";
import { useEffect, useState } from "react";

type Props = {
    profile: Profile;
    story: Story;
    character: Character;
    setValue: (desc: string) => void;
    initValue?: string;
    label: string;
    name: string;
    placeholder?: string;
    description?: string;
    maxLength?: number;
    isRequired?: boolean;
    buttonLabel: string;
    api: string;
    minRows?: number;
    maxRows?: number;
    isInvalid?: boolean;
    errorMessage?: string;
}

export default function StoryInputWithAI(props: Props) {
    const [localValue, setLocalValue] = useState(props.initValue || "");
    const { messages, isLoading, reload } = useChat({
        api: props.api,
        initialMessages: [{
            id: "0",
            content: "Generate",
            role: "user"
        }],
        maxSteps: 5,
        keepLastMessageOnError: true,
        body: {
            profile: props.profile,
            character: props.character,
            story: props.story
        },
        onFinish: (message) => {
            props.setValue(message.content);
        }
    });



    useEffect(() => {
        if(messages.length > 1) {
            const content = messages[messages.length - 1].content;
           setLocalValue(content);
        }
    }, [messages])

    // update local value when changing manually
    useEffect(() => {
        if(!isLoading) {
            props.setValue(localValue);
        }
    }, [localValue])

    return (
        <>
        <div className="flex flex-col items-start">
            <TextareaWithCounter 
                name={props.name}
                isRequired={props.isRequired}
                value={localValue}
                isDisabled={isLoading}
                onValueChange={setLocalValue}
                label={props.label}
                placeholder={props.placeholder}
                description={props.description} 
                maxLength={props.maxLength ?? 0} 
                minRows={props.minRows}
                maxRows={props.maxRows}
                isInvalid={props.isInvalid}
                errorMessage={props.errorMessage}
            />
            <Button 
                isLoading={isLoading} 
                onClick={reload} 
                variant="light" color="primary" 
                startContent={<Icon>auto_awesome</Icon>}
            >
                {props.buttonLabel}
            </Button>
        </div>
        </>
    )
}