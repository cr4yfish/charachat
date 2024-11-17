"use server";

import { getCurrentUser } from "@/functions/db/auth";
import Navbar from "./Navbar";


export default async function NavbarServerWrapper() {
    
    const profile = await getCurrentUser();

    return (
        <>
        <Navbar profile={profile} />
        </>
    )
}