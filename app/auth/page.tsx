"use server"

import Link from "next/link"

import LoginCard from "@/components/auth/LoginCard"
import { Button } from "@/components/utils/Button"

export default async function Login() {

    return (
        <>
        <div className="z-10 px-4 py-6 h-screen flex flex-col gap-4 items-center justify-center pt-[15vh] pb-[33vh]">
            <p>Login or sign up</p>
            <LoginCard />
            <Link href="/signup">
                <Button isDisabled variant="flat" color="secondary" size="lg">Sign up instead</Button>
            </Link>
        </div>
        </>
    )
}