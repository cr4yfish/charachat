"use client";

import { ToolInvocation } from "ai";
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Chat } from "@/types/db";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type Props = {
    toolInvocation: ToolInvocation,
    setChat: React.Dispatch<React.SetStateAction<Chat | null>>
}

export default function AddNewMemoryTool(props: Props) {
    const {toast} = useToast();

    useEffect(() => {
        if("result" in props.toolInvocation) {
            const memory = props.toolInvocation.result;
            props.setChat((prev) => {
                if(!prev) return {} as Chat; // this should never actually run
                return {
                    ...prev,
                    dynamic_book: prev.dynamic_book + ". " + memory,
                }
            })
            toast({
                title: "Added something to memory",
                description: memory,
                variant: "success"
            })
        }
    }, [props.toolInvocation])

    return 'result' in props.toolInvocation ? (
        null
    ) : (
        <Alert key={props.toolInvocation.toolCallId} className=" dark:bg-transparent ">
            <AlertTitle className="flex items-center gap-2 dark:prose-invert">
                <Spinner size="sm" />
                <p className=" dark:text-zinc-400 ">Adding a new memory...</p>
            </AlertTitle>
        </Alert>
    );
}