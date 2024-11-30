"use client";

import { Message as AIMessage, ToolInvocation } from "ai";
import GenericTool from "./Tools/GenericTool";
import AddNewMemoryTool from "./Tools/AddNewMemoryTool";
import GenerateImageTool from "./Tools/GenerateImageTool";
import { Chat, Profile } from "@/types/db";
import SummarizeTool from "./Tools/SummarizeTool";

type Props = {
    message: AIMessage,
    chat: Chat | null,
    setChat: React.Dispatch<React.SetStateAction<Chat | null>>,
    user: Profile,
    setMessages: (messages: AIMessage[] | ((messages: AIMessage[]) => AIMessage[])) => void,
}

export default function ToolMessage(props: Props) {

    if(!props.message.toolInvocations) {
        return null;
    }

    return (
        <div className="mb-4">
            {props.message.toolInvocations?.map((toolInvocation: ToolInvocation) => {

                if(toolInvocation.toolName == "addNewMemory") {
                    return <AddNewMemoryTool 
                                key={toolInvocation.toolCallId}
                                toolInvocation={toolInvocation}
                                setChat={props.setChat}
                            />
                }

                if(toolInvocation.toolName == "generateImage") {
                    return <GenerateImageTool 
                                key={toolInvocation.toolCallId}
                                toolInvocation={toolInvocation}
                                chat={props.chat}
                                user={props.user}
                                setMessages={props.setMessages}
                            />
                }

                if(toolInvocation.toolName == "summarize"){
                    return <SummarizeTool 
                                key={toolInvocation.toolCallId}
                                toolInvocation={toolInvocation}
                            />
                }

                if(toolInvocation) {
                    return <GenericTool 
                                key={toolInvocation.toolCallId} 
                                toolInvocation={toolInvocation}
                            />
                }

            })}
        </div>
    )
}