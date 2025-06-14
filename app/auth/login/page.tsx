"use server"

import Form from "next/form"
import Link from "next/link"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { login } from "../actions"

export default async function Login() {

    const handleSubmit = async (formData: FormData) => {
        'use server'
        await login(formData)
        // Handle any additional logic after login if needed
    }

    return (
        <>
        <div className="z-10 px-4 py-6 h-screen flex flex-col gap-4 items-center justify-center pt-[15vh] pb-[33vh]">
            <p>Login or sign up</p>
            <Form action={handleSubmit} className="w-full">
                <Card>
                    <CardHeader>Login</CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input name="email" type="email" />
                        <Label htmlFor="password">Password</Label>
                        <Input name="password" type="password" />
                    </CardContent>
                    <CardFooter>
                        <Button>Login</Button>
                    </CardFooter>
                </Card>
            </Form>
            <Link href="/signup">Sign up instead</Link>
        </div>
        </>
    )
}