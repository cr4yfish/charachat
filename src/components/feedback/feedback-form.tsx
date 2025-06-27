"use client";

import { useState, FormEvent } from "react";
import { sendFeedback } from "@/lib/db/feedback";
import { DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";
import Spinner from "../ui/spinner";
import { usePathname } from "next/navigation";

export default function FeedbackForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isError, setIsError] = useState(false);
    const [feedback, setFeedback] = useState("");
    const pathname = usePathname();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if(isLoading || feedback.length == 0) return;

        setIsLoading(true);
        setIsError(false);

        try {
            await sendFeedback({ feedback, source: pathname });
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
                onChange={setFeedback}
            />
            <div className="flex justify-end gap-2">
                <DialogClose asChild>
                    <Button disabled={isLoading} variant={"ghost"} >Close</Button>
                </DialogClose>
                <Button 
                    color={isSubmitted ? "success" : isError ? "danger" : "primary"}
                    type="submit" disabled={isLoading || feedback.length === 0}
                >
                    { isLoading && <Spinner />}
                    { isSubmitted ? "Submitted!" : isError ? "Error!" : "Submit" }
                </Button>
            </div>
        </form>
    )
}