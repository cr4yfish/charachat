"use server"

import dynamic from "next/dynamic"
import { checkIsLoggedIn } from "@/functions/db/auth"
import { redirect } from "next/navigation"

const LoginCard = dynamic(() => import("@/components/auth/LoginCard"))

export default async function Login() {

    const isLoggedIn = await checkIsLoggedIn()
    if(isLoggedIn) { redirect("/") }

    return (
        <>
        <div className="z-10 px-4 py-6 h-screen flex flex-col gap-4 items-center justify-center">
            <LoginCard />
        </div>
        </>
    )
}