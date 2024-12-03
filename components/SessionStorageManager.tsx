"use client";

import { useEffect } from "react";

type Props = {
    keyCookie?: string | undefined;
}

/**
 * This component makes sure that the session storage hold the encryption key for as long as there's a cookie for it
 * @param props 
 * @returns 
 */
export default function SessionStorageManager(props: Props) {

    useEffect(() => {
        if(window) {
            window.sessionStorage.setItem("key", props.keyCookie || "");
        }
    }, [])

    return null;
}