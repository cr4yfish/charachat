"use client";

import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/ui/input-with-label";
import Spinner from "@/components/ui/spinner";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import Form from "next/form";
import { useState } from "react";
import { toast } from "sonner";


export default function MigrateFixEncryptedDataPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (formData: FormData) => {
        setIsLoading(true);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const promise = fetch(API_ROUTES.FIX_ENCRYPTION_KEY, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        }).finally(() => {
            setIsLoading(false);
        });
        
        toast.promise(promise, {
            loading: "Fixing your encryption key...",
            success: "Encryption key fixed successfully! You can now access your encrypted data.",
            error: "Failed to fix encryption key. Please check your email and password.",
        })
    }

    return (
        <div className="flex flex-col h-full w-full px-4 ios-safe-header-padding-chats pb-[100px] overflow-y-auto prose dark:prose-invert">
            <p className="mb-4">If you have migrated your Charachat v1 account and see something like this </p>
             <pre>ENC:123455...</pre>
            <p>then that means your current device doesn&apos;t have your old encryption key. Luckily that&apos;s not a big issue and you can fix that right here.</p>

            <Form action={handleSubmit} className="flex flex-col gap-4 mt-4">
                <InputWithLabel 
                    label="Charachat v1 Email"
                    name="email" id="email"
                />
                <InputWithLabel
                    label="Charachat v1 Password"
                    type="password" name="password" id="password"
                />
                <Button disabled={isLoading}>
                    {isLoading && <Spinner />}
                    Submit
                </Button>
            </Form>
        </div>
    )
}