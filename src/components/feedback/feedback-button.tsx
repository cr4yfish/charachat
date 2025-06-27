"use client";

import dynamic from "next/dynamic";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { CircleAlertIcon } from "lucide-react";


const FeedbackForm = dynamic(() => import("./feedback-form"), { ssr: false });

export default function FeedbackButton() {
    return (
        <>
        <Dialog>
            <DialogTrigger asChild>
                <Button size={"icon"} variant={"ghost"} >
                    <CircleAlertIcon size={24} />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Submit Anonymous Feedback</DialogTitle>
                <DialogDescription>
                    Charachat survives on User feedback and suggestions. Feedback submitted here is completely anonymous. Thank you very much for your time! <b>Please contact me on <a className="underline text-blue-500" href="https://www.reddit.com/r/Charachat">Reddit</a> for more specific issues.</b>
                </DialogDescription>
                </DialogHeader>
                    <FeedbackForm />
            </DialogContent>
        </Dialog>
        </>
    )
}