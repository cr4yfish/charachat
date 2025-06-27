"use client";


import LLMSelect from "@/components/chat/llm-select";
import { BetterSwitch } from "@/components/ui/better-switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";
import { ModelId } from "@/lib/ai/types";
import { Profile, ProfileSettings } from "@/lib/db/types/profile";
import { useCallback, useEffect, useState } from "react";
import Spinner from "../ui/spinner";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { API_ROUTES } from "@/lib/constants/apiRoutes";

export default function UserSettingsPage() {    
    const { profile, isLoading, isValidating } = useProfile();
    const [internalProfile, setInternalProfile] = useState<Profile | undefined>(profile);
    const [isUpdating, setIsUpdating] = useState(false);
    
    useEffect(() => {
        if(!profile) return;
        // Initialize internal profile with the fetched profile
        setInternalProfile(profile);
    }, [profile]);

    const handleChangeLLM = useCallback((newLLM: string) => {
        if (!internalProfile) return;
        setInternalProfile({
            ...internalProfile,
            default_llm: newLLM,
            settings: {
                ...internalProfile.settings,
                default_llm: newLLM,
            }
        });
    }, [internalProfile]);

    const handleSettingsChange = useCallback((newSettings: Partial<ProfileSettings>) => {
        if (!internalProfile) return;
        setInternalProfile({
            ...internalProfile,
            settings: {
                ...internalProfile.settings,
                ...newSettings,
            }
        });
    }, [internalProfile]);

    const handleSave = useCallback(() => {
        if (!internalProfile) return;
        setIsUpdating(true);
        const responsePromise = fetch(API_ROUTES.UPDATE_PROFILE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(internalProfile),
        }).finally(() => {
            setIsUpdating(false);
        });

        toast.promise(responsePromise, {
            loading: "Saving settings...",
            success: "Settings saved successfully!",
            error: "Failed to save settings. Please try again.",
        });

    }, [internalProfile]);

    return (
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
            <div className="text-xs text-muted-foreground">
                {(isLoading || isValidating) ? <span className="flex items-center gap-1"><Spinner /> Syncing with your profile...</span> : <span>Profile loaded</span> }
            </div>

            <BetterSwitch 
                label="Unblur NSFW"
                description="Enable this to unblur NSFW content in images by default."
                checked={internalProfile?.settings?.show_nsfw ?? false}
                onCheckedChange={(checked) => handleSettingsChange({ show_nsfw: checked })}
            />

            <LLMSelect 
              selectedKey={internalProfile?.default_llm as ModelId}
              onSelect={handleChangeLLM}
              isLoading={isLoading}
              label="Select the Author Model"
              description="The model used for writing help (e.g. generating descriptions)"
            />

            <Button onClick={handleSave} disabled={isUpdating || isLoading} variant={"secondary"}>
                {isUpdating && <Spinner />}
                Save
            </Button>
          </CardContent>
        </Card>
    )
}