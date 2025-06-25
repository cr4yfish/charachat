"use client";

import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { fetcher } from "@/lib/utils";
import { safeParseLink } from "@/lib/utils/text";
import { Profile } from "@/lib/db/types/profile";
import Image from "next/image";
import { memo } from "react";
import useSWR from "swr";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Spinner from "./spinner";

const PureSidebarUser = () => {
    const { user} = useUser();
    const { data: profile, isLoading } = useSWR<Profile>(API_ROUTES.GET_OWN_PROFILE, fetcher)

    return (
        <div className="flex flex-row items-center justify-center gap-2 h-full">
            <DropdownMenu>
                <DropdownMenuTrigger className="w-full flex flex-row items-center gap-2 bg-primary/5 border border-border/5 px-4 py-3 rounded-3xl focus:ring-0 !outline-0">
                    <div className="overflow-hidden size-[24px] rounded-full relative shrink-0">
                        <Image 
                            alt="" fill className="object-cover"
                            src={safeParseLink(profile?.avatar_link)}
                        />
                    </div>
                    <div className="flex flex-col items-start gap-1 w-full overflow-hidden">
                        <span className="font-medium text-xs h-[16px]">{isLoading ? <Spinner /> : profile?.username}</span>
                        <span className="text-xs text-muted-foreground/75 truncate w-[80%]">{user?.emailAddresses[0]?.emailAddress}</span>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem><SignOutButton /></DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
   
            
        </div>
    )
}

const SidebarUser = memo(PureSidebarUser);

export default SidebarUser;