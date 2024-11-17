"use client";

import { useRouter } from "next/navigation";
import { Input } from "@nextui-org/input";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";

import { useToast } from "@/hooks/use-toast";
import { Button } from "../utils/Button";
import { FormEvent, useState } from "react";
import { login, LoginResponse, signUp } from "@/functions/db/auth";

import { loginSchema, signUpSchema } from "@/lib/schemas";
import { generateKey } from "@/lib/crypto";

type Props = {
    shouldRedirect?: boolean;
    redirectPath?: string;
    callback?: () => void;
}

export default function LoginCard(props: Props) {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [avatarLink, setAvatarLink] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmit, setIsSubmit] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const { toast } = useToast();
    const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setIsSubmit(true);

        try {

            let success = false;

            if(isSignUp) {

                // validate input
                const signUpResult = signUpSchema.safeParse({ username, firstName, lastName, avatarLink, email, password });

                if(!signUpResult.success) {
                    throw new Error("Invalid input");
                }

                const result = await signUp({
                    username: username ?? "",
                    firstName: firstName ?? "",
                    lastName: lastName ?? "",
                    avatarLink: avatarLink ?? "",
                    email: email ?? "",
                    password: password ?? "",
                });
                setLoginResponse(result);
                success = result.success ?? false;
            } else {

                // validate input
                const loginResult = loginSchema.safeParse({ email, password });

                if(!loginResult.success) {
                    throw new Error("Invalid input");
                }

                const result = await login(email, password);
                setLoginResponse(result);
                success = result.success ?? false;
            }

            if(success) {
                console.log("Logged in successfully");
                const keyBuffer = generateKey(password, email);

                sessionStorage.setItem("key", keyBuffer.toString("hex"));

                if(props.shouldRedirect) {
                    router.replace(props.redirectPath ?? "/");
                } else {
                    toast({
                        title: "Success",
                        description: "Logged in successfully",
                    })
                    console.log("Refreshing")
                    router.refresh();
                }

                // if we are on the same page which is the redirect target
                // then we need to close the modal since refresh wont work
                if(props.callback) {
                    props.callback();
                }

            } else {
                throw new Error("Failed to log in");
            }
        } catch (e) {
            const err = e as Error;
            console.error("Error in LoginCard",err);
            setIsLoading(false);
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
        }
    }

    return (
        <>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
            <Card>
                <CardHeader className="text-2xl font-bold">{isSignUp ? "Sign up ": "Log in"}</CardHeader>
                <CardBody className="flex flex-col gap-2">

                    {isSignUp && (
                        <>
                        <Input 
                            name="username" 
                            type="text"
                            isRequired={isSignUp} 
                            label="Username" 
                            description="Your public display name"
                            value={username} 
                            onValueChange={setUsername} 
                            errorMessage={ signUpSchema.shape.username.safeParse(username).error?.issues[0]?.message }
                            isInvalid={ isSubmit && signUpSchema.shape.username.safeParse(username).error?.issues[0]?.message ? true : false }
                        />
                        <Input 
                            name="first_name" 
                            type="text" 
                            description="What the AI will call you. Only visible to you & AI"
                            isRequired={isSignUp}
                            label="First Name" 
                            value={firstName} 
                            onValueChange={setFirstName} 
                            errorMessage={ signUpSchema.shape.firstName.safeParse(firstName).error?.issues[0]?.message }
                            isInvalid={
                                isSubmit && signUpSchema.shape.firstName.safeParse(firstName).error?.issues[0]?.message ? true : false
                            }
                        />
                        <Input 
                            name="last_name" 
                            type="text" 
                            label="Last Name" 
                            value={lastName} 
                            onValueChange={setLastName} 
                            errorMessage={ signUpSchema.shape.lastName.safeParse(lastName).error?.issues[0]?.message }
                            isInvalid={ isSubmit && signUpSchema.shape.lastName.safeParse(lastName).error?.issues[0]?.message ? true : false }
                        />
                        <Input 
                            name="image_link" 
                            type="text" 
                            label="Avatar Image Link" 
                            placeholder="https://example.com/image.jpg"
                            value={avatarLink} 
                            onValueChange={setAvatarLink} 
                            errorMessage={ signUpSchema.shape.avatarLink.safeParse(avatarLink).error?.issues[0]?.message }
                            isInvalid={ isSubmit && signUpSchema.shape.avatarLink.safeParse(avatarLink).error?.issues[0]?.message ? true : false }
                        />

                        </>
                    )}

                    <Input 
                        name="email" 
                        type="email" 
                        label="Email" 
                        value={email} 
                        isRequired
                        onValueChange={setEmail} 
                        errorMessage={ loginResponse?.validationError && loginSchema.shape.email.safeParse(email).error?.issues[0]?.message }
                        isInvalid={ isSubmit && loginSchema.shape.email.safeParse(email).error?.issues[0]?.message ? true : false }
                    />
                    <Input 
                        name="password" 
                        type="password" 
                        label="Password" 
                        value={password}
                        isRequired 
                        onValueChange={setPassword} 
                        errorMessage={ loginSchema.shape.password.safeParse(password).error?.issues[0]?.message }
                        isInvalid={ isSubmit && loginSchema.shape.password.safeParse(password).error?.issues[0]?.message ? true : false }
                    />
                </CardBody>
                <CardFooter className="flex flex-col gap-2 items-start">
                    <Button 
                        fullWidth 
                        type="submit" 
                        size="lg" 
                        color={loginResponse?.success ? "success" : "primary"}
                        isLoading={isLoading}
                    >
                        { loginResponse?.success ? "Redirecting" : isSignUp ? "Sign up" : "Log in" }
                    </Button>
                    <div>
                        <Button onClick={() => setIsSignUp(!isSignUp)} variant="light" color="primary">{isSignUp ? "Log in" : "Sign up"} instead</Button>
                    </div>
                </CardFooter>
            </Card>
        </form>
        </>
    )
}