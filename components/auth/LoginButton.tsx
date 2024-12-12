"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/functions/db/auth";
import { useState } from "react";
import { Button } from "../utils/Button";
import Icon from "../utils/Icon";
import { useLoginDialog } from "@/context/LoginDialogProvider";
type Props = {
    showLogout?: boolean;
    isSmall?: boolean;
}

export default function LoginButton(props: Props) {
    const router = useRouter();
    const { isLoggedIn, setIsLoggedIn, openDialog } = useLoginDialog();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        setIsLoggedIn(false);
        await logout();
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

            {!isLoggedIn &&
                <Button 
                    color="primary" variant="flat" 
                    size="lg" fullWidth
                    startContent={<Icon filled>login</Icon>}
                    onClick={openDialog}
                >
                    Log in
                </Button>
            }
        </>
    )
}