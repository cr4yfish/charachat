"use client";

import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/ui/input-with-label";
import Spinner from "@/components/ui/spinner";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function MigratePage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);

        toast.info("Starting migration. Keep this page open until the process is complete.", {
            duration: 5000,
            description: "This may take a few minutes depending on the amount of data.",
        });
        fetch(API_ROUTES.MIGRATION, {
            method: "POST",
            body: formData
        }).then(async (response) => {
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Migration failed");
            }
            const data = await response.json();
            if (data.success) {
                toast.success("Migration successful! You can now use your previous data.", {
                    duration: 5000,
                    description: "You can now continue using Charachat with your migrated settings and chats.",
                });
                router.push("/home/settings");
            } else {
                toast.error("Migration failed: " + (data.error || "Unknown error"), {
                    duration: 5000,
                    description: "Please try again or contact support if the issue persists.",
                });
            }
        }).catch((error) => {
            setIsLoading(false);
            toast.error("Migration failed: " + (error.message || "Unknown error"), {
                duration: 5000,
                description: "Please try again or contact support if the issue persists.",
            });
        }).finally(() => {
            setIsLoading(false);
        })
    }

    return (
        <div className="flex flex-col gap-4 h-full w-full px-4 pt-[75px] pb-[100px] overflow-y-auto">
            <div className="flex flex-col gap-2 text-muted-foreground">
                <h1 className="text-2xl font-bold text-white">Migration from Charachat v1</h1>
                <p>If you were a Charachat user, you can migrate your settings and chats to the new system. This will allow you to continue using your previous data seamlessly.</p>
                <p>Please note that this migration is one-way and cannot be undone.</p>
                <p>Click the button below to start the migration process.</p>
            </div>

            <Form action={handleSubmit} className="flex flex-col gap-2">
                <InputWithLabel 
                    label="Charachat v1 Email"
                    description="Enter the email address you used for Charachat v1."
                    placeholder="example@mail.com"
                    name="email"
                />
                <InputWithLabel
                    label="Charachat v1 Password"
                    type="password"
                    description="Enter the password you used for Charachat v1."
                    placeholder="********"
                    name="password"
                />
                <Button disabled={isLoading} type="submit">
                    {isLoading ? <><Spinner /> Migrating. Do not close this page</> : "Migrate Now"}
                </Button>
            </Form>

        </div>
    );
}