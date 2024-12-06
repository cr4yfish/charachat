"use client";

import Link from "next/link";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { useEffect, useState } from "react";
import { Button } from "../utils/Button";
import { DialogClose } from "@radix-ui/react-dialog";


export default function RedditPopup() {
    const [dialogOpen, setDialogOpen] = useState(false);
    

    useEffect(() => {

        if(window) {
            const complete = window.localStorage.getItem("redditComplete");
            if(!complete) {
                setDialogOpen(true);
                window.localStorage.setItem("redditComplete", "true");
            }
        }

    }, [])

    return (
        <>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen} >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Join the Subreddit</DialogTitle>
                    <DialogDescription>Don&apos;t miss important updates and information</DialogDescription>
                    <div className="flex flex-col gap-2">
                        <Link href={`https://www.reddit.com/r/charachat`} target="_blank">
                            <Button 
                                color="primary" 
                                size="lg" 
                                radius="full" 
                                onClick={() => setDialogOpen(false)}
                            >
                                r/Charachat
                            </Button>
                        </Link>
                        <DialogClose asChild>
                            <Button radius="full" variant="light">
                                Don&apos;t show this again
                            </Button>
                        </DialogClose>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
        </>
    )
}