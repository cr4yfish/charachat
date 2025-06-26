"use server";

import APIKeyInputCard from "@/components/settings/api-key-input.card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import UserSettingsPage from "@/components/settings/user-settings";

export default async function PureSettingsPage() {

  await auth.protect({
    unauthorizedUrl: "/",
    unauthenticatedUrl: "/",
  });

  return (
    <div className="flex flex-col h-full w-full px-4 ios-safe-header-padding-chats pb-[100px] overflow-y-auto">

      <div className="flex flex-col gap-4">

        <UserSettingsPage />

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
            <Link href={"/home/settings/migrate/fix-encrypted-data"}>
              <Button>Fix encrypted Data</Button>
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}