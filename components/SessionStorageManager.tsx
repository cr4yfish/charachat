"use client";

import { Profile } from "@/types/db";
import { useEffect } from "react";

type Props = {
    keyCookie?: string | undefined;
    profile: Profile | undefined
}

/**
 * This component makes sure that the session storage hold the encryption key for as long as there's a cookie for it
 * @param props 
 * @returns 
 */
export default function SessionStorageManager(props: Props) {

    useEffect(() => {
        if(window) {
            if(props.profile && props.keyCookie) {
                window.sessionStorage.setItem("key", props.keyCookie);
            } else {
                window.sessionStorage.removeItem("key");
                window.location.reload();
            }
        }
    }, [])

    return null;
}