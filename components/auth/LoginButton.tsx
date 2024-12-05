"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/functions/db/auth";
import { useState } from "react";
import { Button } from "../utils/Button";
import Icon from "../utils/Icon";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import LoginCard from "./LoginCard";
  
type Props = {
    isLoggedIn: boolean;
    showLogout?: boolean;
    isSmall?: boolean;
}

export default function LoginButton(props: Props) {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(props.isLoggedIn ?? false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        setIsLoggedIn(false);
        await logout();

        sessionStorage.removeItem("key");

        router.refresh();
    }

    return (
        <>
            {isLoggedIn && props.showLogout &&
                <Button 
                    color="danger" variant="flat" 
                    size="lg" fullWidth
                    startContent={<Icon filled>logout</Icon>}
                    onClick={handleLogout}
                    isLoading={isLoggingOut}
                >
                    Log out
                </Button>
            }

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen} >
                {!isLoggedIn && 
                    <DialogTrigger asChild>
                        <Button 
                            color="primary" radius="full"
                            size={props.isSmall ? "md" : "lg"} 
                            fullWidth={!props.isSmall}
                        >
                            Log in
                        </Button>
                    </DialogTrigger>
                }
                <DialogContent className="dark:bg-transparent dark:border-none">
                    <DialogHeader>
                        <DialogTitle></DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <LoginCard callback={() => {setDialogOpen(false); setIsLoggedIn(true)}} />
                </DialogContent>
            </Dialog>

        </>
    )
}