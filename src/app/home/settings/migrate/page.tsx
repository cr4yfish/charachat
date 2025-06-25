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
                    duration: 10000,
                    description: "You can now continue using Charachat with your old Chats and Characters.",
                });
                router.push("/home/settings");
            } else {
                toast.error("Migration failed: " + (data.error || "Unknown error"), {
                    duration: 5000,
                    description: "Try it again or Please contact me on reddit or discord.",
                });
            }
        }).catch((error) => {
            setIsLoading(false);
            toast.error("Migration failed: " + (error.message || "Unknown error"), {
                duration: 5000,
                description: "Try it again or Please contact me on reddit or discord.",
            });
        }).finally(() => {
            setIsLoading(false);
        })
    }

    return (
        <div className="flex flex-col gap-4 h-full w-full px-4 pt-[75px] pb-[100px] overflow-y-auto">
            <div className="flex flex-col gap-2 text-muted-foreground text-sm">
                <p>If you were a Charachat user, you can connect your old account to the new system. This will allow you to continue using your previous data seamlessly.</p>
                <p>Please note that this migration is one-way and cannot be undone.</p>
                <p>Please also not that this is <span className="font-bold">EXPERIMENTAL CURRENTLY</span></p>
                <p>It does work, but I have not tested this enough yet to confirm this works for every user!</p>
                <p>You might encounter encrypted data (ENC:) after this. This does not mean data loss. I&apos;m working on a permanent fix for that.</p>
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

                <p className="text-xs text-muted-foreground">Do NOT leave the page once the process is started! I have no idea what might happen. In theory you should be able to start it again.</p>
                <Button disabled={isLoading} type="submit">
                    {isLoading ? <><Spinner /> Migrating. Do not close this page</> : "Migrate Now"}
                </Button>
                <p className="text-xs text-muted-foreground">IF there are errors displayed: KEEP CALM! If there is an error banner, then that means I accounted for that error and it WON&apos;T break your account!</p>
            </Form>

        </div>
    );
}