"use client";

import dynamic from "next/dynamic";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./utils/Button";
import Icon from "./utils/Icon";
const FeedbackForm = dynamic(() => import("./FeedbackForm"), { ssr: false });

type Props = {
    source: string;
}

export default function FeedbackButton(props: Props) {
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
                    Charachat survives on User feedback and suggestions. Feedback submitted here is completely anonymous. Thank you very much for your time!
                    <b>Please contact me on <a className="underline text-blue-500" href="https://www.reddit.com/r/Charachat">Reddit</a> for more specific issues.</b>
                </DialogDescription>
                </DialogHeader>
                    <FeedbackForm source={props.source} />
            </DialogContent>
        </Dialog>
        </>
    )
}