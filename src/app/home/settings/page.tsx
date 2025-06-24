"use server";

import LLMSelect from "@/components/chat/llm-select";
import APIKeyInputCard from "@/components/settings/api-key-input.card";
import { BetterSwitch } from "@/components/ui/better-switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { _DEFAULT_LLM } from "@/lib/constants/defaults";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function PureSettingsPage() {

  await auth.protect({
    unauthorizedUrl: "/",
    unauthenticatedUrl: "/",
  });

  return (
    <div className="flex flex-col h-full w-full px-4 pt-[75px] pb-[100px] overflow-y-auto">

      <div className="flex flex-col gap-4">

        <Card>
          <CardHeader>
            <CardTitle>
              Personal Settings
            </CardTitle>
            <CardDescription>
              These settings are specific to your account and will be applied across all your chats. You can change them at any time.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <BetterSwitch 
              label="Unblur NSFW"
              disabled
              description="Enable this to unblur NSFW content in images by default."
            />

            <LLMSelect 
              disabled
              selectedKey={_DEFAULT_LLM}
              label="Select the Author Model"
              description="The model used for writing help (e.g. generating descriptions)"
            />
          </CardContent>
        </Card>

        <APIKeyInputCard />

        <Card>
          <CardHeader>
            <CardTitle>
              Account
            </CardTitle>
            <CardDescription>
              Manage your account settings, including API keys and user information.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <UserButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Charachat v1 Migration
            </CardTitle>
            <CardDescription>
              If you were a Charachat user, you can migrate your settings and chats to the new system. This will allow you to continue using your previous data seamlessly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link href={"/home/settings/migrate"}>
              <Button>Migrate</Button>
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}