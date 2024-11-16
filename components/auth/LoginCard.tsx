"use client";

import { Input } from "@nextui-org/input";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";

import { Button } from "../utils/Button";
import { FormEvent, useState } from "react";
import { login, LoginResponse } from "@/functions/db/auth";

import { loginSchema } from "@/lib/schemas";

export default function LoginCard() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmit, setIsSubmit] = useState(false);

    const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setIsSubmit(true);

        const result = await login(email, password);
        setLoginResponse(result);

        if(result.success) {
            window.location.href = "/";
        }
    }

    const checkFormValid = () => {
        return loginSchema.safeParse({ email, password }).success;
    }

    return (
        <>
        <form onSubmit={handleSubmit} className="w-full">
            <Card>
                <CardHeader className="text-2xl font-bold">Login</CardHeader>
                <CardBody className="flex flex-col gap-2">
                    <Input 
                        name="email" 
                        type="email" 
                        label="Email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        errorMessage={
                                loginSchema.safeParse({ email, password }).error?.errors?.find(err => err.path[0] === "email")?.message
                                ||
                                loginResponse?.validationError?.errors?.find(err => err.path[0] === "email")?.message
                        }
                        isInvalid={
                            isSubmit && loginSchema.safeParse({ email, password }).error ? true : false
                            ||
                            loginResponse?.validationError?.errors?.find(err => err.path[0] === "email") ? true : false
                        }
                    />
                    <Input 
                        name="password" 
                        type="password" 
                        label="Password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        errorMessage={
                            loginSchema.safeParse({ email, password }).error?.errors?.find(err => err.path[0] === "password")?.message
                            ||
                            loginResponse?.validationError?.errors?.find(err => err.path[0] === "password")?.message
                        }
                        isInvalid={
                            isSubmit && loginSchema.safeParse({ email, password }).error ? true : false
                            ||
                            loginResponse?.validationError?.errors?.find(err => err.path[0] === "password") ? true : false
                        }
                    />
                </CardBody>
                <CardFooter>
                    <Button 
                        fullWidth 
                        type="submit" 
                        size="lg" 
                        variant="shadow" 
                        color={loginResponse?.success ? "success" : "primary"}
                        isLoading={isLoading}
                        isDisabled={!checkFormValid()}
                    >
                        { 
                            loginResponse?.success ? "Redirecting" : "Login"
                        }
                    </Button>
                </CardFooter>
            </Card>
        </form>
        </>
    )
}