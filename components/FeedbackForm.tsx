"use client";

import TextareaWithCounter from "./utils/TextareaWithCounter";
import { DialogClose } from "./ui/dialog";
import { Button } from "./utils/Button";
import { FormEvent, useState } from "react";
import { sendFeedback } from "@/functions/db/feedback";

type Props = {
    source: string;
}

export default function FeedbackForm(props: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isError, setIsError] = useState(false);
    const [feedback, setFeedback] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if(isLoading || feedback.length == 0) return;

        setIsLoading(true);
        setIsError(false);

        try {
            await sendFeedback({ feedback, source: props.source });
            setIsSubmitted(true);
        } catch (error) {
            console.error(error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <TextareaWithCounter 
                label="Feedback"
                placeholder="Enter your feedback here..."
                maxLength={2000}
                value={feedback}
                onValueChange={setFeedback}
            />
            <div className="flex justify-end gap-2">
                <DialogClose asChild>
                    <Button isDisabled={isLoading} variant="light" radius="full">Close</Button>
                </DialogClose>
                <Button 
                    color={isSubmitted ? "success" : isError ? "danger" : "primary"}
                    radius="full" 
                    type="submit"
                    isLoading={isLoading}
                >
                    { isSubmitted ? "Submitted!" : isError ? "Error!" : "Submit" }
                </Button>
            </div>
        </form>
    )
}