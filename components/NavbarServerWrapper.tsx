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
        // Anons are allowed here, not an error
        if(err.message !== "No user found") {
            console.error("Error in LeftSidebar", e);
        };
    }

    return (
        <>
        <Navbar profile={profile} />
        </>
    )
}