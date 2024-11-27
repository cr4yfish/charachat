"use client";

import { ToolInvocation } from "ai";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@nextui-org/spinner";

type Props = {
    toolInvocation: ToolInvocation,
}

export default function SummarizeTool(props: Props) {

    return "result" in props.toolInvocation ? (
        <Alert key={props.toolInvocation.toolCallId} className="dark:prose-invert dark:text-zinc-400 dark:bg-transparent max-w-lg justify-self-center">
            <AlertTitle>Chat Summary</AlertTitle>
            <AlertDescription>
                {props.toolInvocation.args.text}
            </AlertDescription>
        </Alert>
    ) : (
        <Alert key={props.toolInvocation.toolCallId} className=" dark:bg-transparent ">
            <AlertTitle className="flex items-center gap-2 dark:prose-invert">
                <Spinner size="sm" />
                <p className=" dark:text-zinc-400 ">Summarizing Chat...</p>
            </AlertTitle>
        </Alert>
        
    )
}