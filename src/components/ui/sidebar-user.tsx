"use client";

import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { fetcher } from "@/lib/utils";
import { safeParseLink } from "@/lib/utils/text";
import { Profile } from "@/lib/db/types/profile";
import Image from "next/image";
import { memo } from "react";
import useSWR from "swr";
import { SignOutButton } from "@clerk/nextjs";

const PureSidebarUser = () => {
    const { data: profile } = useSWR<Profile>(API_ROUTES.GET_OWN_PROFILE, fetcher)

    return (
        <div className="flex flex-row items-center justify-center gap-2 h-full">
            <div className="overflow-hidden size-[24px] rounded-full relative">
                <Image 
                    alt="" fill className="object-cover"
                    src={safeParseLink(profile?.avatar_link)}
                />
            </div>
            <span>{profile?.username}</span>
            <SignOutButton />
        </div>
    )
}

const SidebarUser = memo(PureSidebarUser);

export default SidebarUser;