"use client";

import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { fetcher } from "@/lib/utils";
import { safeParseLink, truncateText } from "@/lib/utils/text";
import { memo, useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { Profile } from "@/lib/db/types/profile";
import Image from "next/image";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useDebounce } from "use-debounce";
import { ImageInput } from "../ui/image-input";
import { InputWithLabel } from "../ui/input-with-label";
import { TextareaWithCounter } from "../ui/textarea-with-counter";
import { Skeleton } from "../ui/skeleton";
import { motion } from "motion/react";
import { Vibrant } from "node-vibrant/browser";
import { TIMINGS_MILLISECONDS } from "@/lib/constants/timings";

type Props = {
    userid: string;
}

const motionAnimate = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
}

const PureYourProfile = ({ userid }: Props) => {
    const { data: profile, mutate, isLoading } = useSWR<Profile>(API_ROUTES.GET_PROFILE + "?id=" + userid, fetcher, {
        revalidateOnFocus: false, // dont revalidate on focus
        revalidateOnReconnect: false, // dont revalidate on reconnect
        keepPreviousData: true, // keep previous data while loading new data
        dedupingInterval: TIMINGS_MILLISECONDS.THIRTY_MINUTES, // 5 minutes
        focusThrottleInterval: TIMINGS_MILLISECONDS.FIVE_MINUTES, // 1 minute
    })
    const [isSaving, setIsSaving] = useState(false);
    const [isError, setIsError] = useState(false);
    const [debouncedProfile] = useDebounce<Profile | undefined>(profile, 2000);
    const [palette, setPalette] = useState<{ Vibrant: string | undefined } | undefined>(undefined);

    useEffect(() => {
        if (!profile?.avatar_link) {
            setPalette(undefined);
            return;
        }

        const vibrant = new Vibrant(safeParseLink(profile.avatar_link));
        vibrant.getPalette().then(pal => {
            const hexPalette = {
                Vibrant: pal.Vibrant?.hex || "#FFFFFF",
            }
            setPalette(hexPalette);
        }).catch((err) => {
            console.error("Error getting palette:", err);
            return null;
        })
    }, [profile?.avatar_link]);

    // update internal profile when the profile prop changes
    const handleProfileChange = (field: keyof Profile, value: string) => {
        const tmpProfile = {
            ...profile,
            [field]: value,
        }

        // Optimistically update the profile in the UI
        mutate(tmpProfile, {
            revalidate: false, // dont revalidate the data
            optimisticData: tmpProfile,
        })
    };

    // save the profile to the server
    const saveProfile = useCallback(async () => {
        setIsSaving(true);
        fetch(API_ROUTES.UPDATE_PROFILE, {
            method: "POST",
            body: JSON.stringify(debouncedProfile),
        }).then(async (res) => {
            if(!res.ok) {
                const errorData = await res.json();
                console.error("Failed to update profile:", errorData.message);
                throw new Error(errorData.message || "Failed to update profile");
            } else {
                setIsError(false);
            }
        }).catch((error) => {
            console.error("Error updating profile:", error);
            setIsError(true);
        }).finally(() => {
            setIsSaving(false);
        })
    }, [debouncedProfile]);

    // update external profile with debounced state
    useEffect(() => {
        if(!debouncedProfile) return;
        saveProfile();

    }, [debouncedProfile, mutate, setIsSaving, saveProfile])

    return (
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <Drawer>
                <DrawerTrigger asChild>
                    <div className="rounded-3xl bg-white text-black p-4 flex flex-col overflow-hidden"
                        style={{
                            backgroundColor: palette?.Vibrant,
                            boxShadow: `0 2px 10px ${palette?.Vibrant || "rgba(0, 0, 0)"}`,
                            cursor: "pointer",
                        }}
                    >
                        <div className="flex flex-row gap-2 w-full">
                            
                            {isLoading && (
                                <div className="animate-pulse bg-gray-200 h-16 w-16 rounded-full"></div>
                            )}

                            {!isLoading && profile?.avatar_link && safeParseLink(profile.avatar_link) && 
                                <div className="relative size-16 shrink-0 rounded-full overflow-hidden">
                                    <Image 
                                        alt=""
                                        fill
                                        src={safeParseLink(profile.avatar_link)}
                                    />
                                </div>
                            }
                            
                            {!isLoading &&
                            <div className="flex flex-col" style={{ color: `color-mix(in srgb, black 70%, ${palette?.Vibrant})` }}>
                                <motion.h2 {...motionAnimate} className="text-xl font-bold">{profile?.username ?? "Tap to set up your profile"}</motion.h2>
                                <motion.p  {...motionAnimate} className="text-xs" >{truncateText(profile?.public_bio, 140)}</motion.p>
                            </div>
                            }

                            {isLoading && 
                            <motion.div  {...motionAnimate} className="flex flex-col gap-0.5 ">
                                <Skeleton className="w-[150px] h-[28px] opacity-15" />
                                <div className="flex flex-col gap-0.5 opacity-25 ">
                                  <Skeleton className="w-[170px] h-[16px]" />  
                                  <Skeleton className="w-[180px] h-[16px]" />  
                                </div>
                                
                            </motion.div>
                            }

                        </div>
                    </div>
                </DrawerTrigger>
                <DrawerContent className="max-w-screen max-h-screen overflow-hidden ios-safe-header-padding">
                    <DrawerHeader className="flex flex-col gap-0 pb-0">
                        <DrawerTitle className="text-start">Profile Settings</DrawerTitle>
                        <DrawerDescription className="text-start">
                            Manage your public profile here.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex flex-col gap-4 p-4 max-w-screen overflow-x-hidden overflow-y-auto">
                        
                        <ImageInput 
                            label="Profile Picture"
                            description="Upload a profile picture that will be visible to others."
                            link={profile?.avatar_link || ""}
                            onImageUpload={(link) => handleProfileChange("avatar_link", link)}
                        />

                        <InputWithLabel 
                            label="Username"
                            placeholder="Enter your username"
                            description="This will be publicly visible and not used by the AI."
                            value={profile?.username || ""}
                            onChange={(e) => handleProfileChange("username", e.target.value)}
                        />

                        <TextareaWithCounter 
                            maxLength={2000}
                            label="Public Bio"
                            placeholder="Enter a short bio about yourself"
                            description="This bio will be visible to others."
                            value={profile?.public_bio || ""}
                            onChange={(value) => handleProfileChange("public_bio", value)}
                        />
                        
                        <div className="flex flex-row gap-2 text-xs text-muted-foreground py-1">
                            <p>Autosave is enabled</p>
                            {isSaving && (
                                <span>Saving...</span>
                            )}
                            {isError && (
                                <span className="text-red-500">Error saving profile</span>
                            )}
                        </div>
                
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}

export const YourProfile = memo(PureYourProfile, (prev, next) => {
    // Only re-render if the userid changes
    return prev.userid === next.userid;
});