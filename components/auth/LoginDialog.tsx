"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import LoginCard from "./LoginCard";
import { useLoginDialog } from "@/context/LoginDialogProvider";
import { useEffect } from "react";


export default function LoginDialog() {
    const { isOpen, setIsOpen, closeDialog, setIsLoggedIn, isLoggedIn } = useLoginDialog();

    useEffect(() => {
        if(!isLoggedIn) {
            const key = sessionStorage.getItem("key")
            if(key) {
                setIsLoggedIn(true);
            }
        }
    }, [isLoggedIn, setIsLoggedIn])

    return (
        <>
        <Dialog open={isOpen} onOpenChange={setIsOpen} >
            <DialogContent className="bg-transparent dark:bg-transparent dark:border-none">
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <LoginCard callback={() => {
                    closeDialog();
                    setIsLoggedIn(true);
                }} />
            </DialogContent>
        </Dialog>
        </>
    )
}