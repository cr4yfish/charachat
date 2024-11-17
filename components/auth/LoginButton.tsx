"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/functions/db/auth";
import { useState } from "react";
import Link from "next/link";
import { Button } from "../utils/Button";
import Icon from "../utils/Icon";

type Props = {
    isLoggedIn: boolean;
}

export default function LoginButton(props: Props) {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(props.isLoggedIn ?? false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        setIsLoggedIn(false);
        await logout();
        router.refresh();
    }

    return (
        <>
            {isLoggedIn &&
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
                <Link href="/auth">
                    <Button 
                        color="primary" 
                        variant="shadow" 
                        size="lg" 
                        startContent={<Icon filled>login</Icon>}
                        fullWidth
                    >
                        Log in
                    </Button>
                </Link>
            }
        </>
    )
}