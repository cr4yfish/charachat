"use server";

import { getCurrentUser } from "@/functions/db/auth";
import LoginButton from "./LoginButton";

type Props = {
    isSmall?: boolean;
    showLogout?: boolean;
}

export default async function LoginButtonServerWrapper(props: Props) {

    let isLoggedIn = false;

    try {
        const profile = await getCurrentUser();
        if(profile.user) {
            isLoggedIn = true;
        }
    } catch (e) {
        const err = e as Error;
        // Anons are allowed here, not an error
        if(err.message !== "No user found") {
            console.error("Error in NavbarServerWrapper", e);
        };
    }
   

    return (
        <LoginButton isLoggedIn={isLoggedIn} {...props} />
    )
}