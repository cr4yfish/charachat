"use client";

import { ToolInvocation } from "ai";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Props = {
    toolInvocation: ToolInvocation,
}

export default function GenericTool(props: Props) {

    return "result" in props.toolInvocation ? (
        <Alert key={props.toolInvocation.toolCallId} className="dark:prose-invert dark:text-zinc-400 dark:bg-transparent max-w-lg justify-self-center">
            <AlertTitle>Executed tool {props.toolInvocation.toolName}</AlertTitle>
            <AlertDescription className="max-w-sm w-full relative break-all">
                {props.toolInvocation.result}
            </AlertDescription>
        </Alert>
    ) : (
        <Alert key={props.toolInvocation.toolCallId} className=" dark:bg-transparent ">
            <AlertTitle className="flex items-center gap-2 dark:prose-invert">
                <Spinner size="sm" />
                <p className=" dark:text-zinc-400 ">Executing tool ${props.toolInvocation.toolName}...</p>
            </AlertTitle>
        </Alert>
        
    )
}