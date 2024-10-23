"use server"

import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card"

import Link from "next/link"
import { Input } from "@nextui-org/input"

import { login } from "./actions"

export default async function Login() {

    return (
        <>
        <div className="z-10 px-4 py-6 h-screen flex flex-col gap-4 items-center justify-center pt-[15vh] pb-[33vh]">
            <p>Login or sign up</p>
            <form className="w-full">
                <Card>
                    <CardHeader>Login</CardHeader>
                    <CardBody className="flex flex-col gap-2">
                        <Input name="email" type="email" label="Email" />
                        <Input name="password" type="password" label="Password" />
                    </CardBody>
                    <CardFooter>
                        <button formAction={login} >Login</button>
                    </CardFooter>
                </Card>
            </form>
            <Link href="/signup">Sign up instead</Link>
        </div>
        </>
    )
}