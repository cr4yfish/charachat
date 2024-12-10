"use client";

import { FormEvent, useState } from "react";

import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogTrigger, DialogClose } from "./ui/dialog";
import { Button } from "./utils/Button";
import TextareaWithCounter from "./utils/TextareaWithCounter";
import { sendFeedback } from "@/functions/db/feedback";
import Icon from "./utils/Icon";

type Props = {
    source: string;
}

export default function FeedbackButton(props: Props) {
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
        <>
        <Dialog>
            <DialogTrigger asChild>
                <Button radius="full" isIconOnly variant="light"><Icon>feedback</Icon></Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Submit Anonymous Feedback</DialogTitle>
                <DialogDescription>
                    <p>Charachat survives on User feedback and suggestions. Feedback submitted here is completely anonymous. Thank you very much for your time!</p>
                    <b>Please contact me on <a className="underline text-blue-500" href="https://www.reddit.com/r/Charachat">Reddit</a> for more specific issues.</b>
                </DialogDescription>
                </DialogHeader>
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
            </DialogContent>
        </Dialog>
        </>
    )
}