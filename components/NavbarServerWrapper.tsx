"use server";
import { getCurrentUser } from "@/functions/db/auth";
import Navbar from "./Navbar";
import { Profile } from "@/types/db";


export default async function NavbarServerWrapper() {

    let profile: Profile | undefined = undefined;

    try {
        profile = await getCurrentUser();
    } catch (e) {
        const err = e as Error;
        if(err.message == "No user found") return; // This is not an issue
        console.error("Error in NavbarServerWrapper", e);
    }

    return (
        <>
        <Navbar profile={profile} />
        </>
    )
}