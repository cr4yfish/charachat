"use server";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
  } from "@/components/ui/sidebar"
import ProfileCard from "./user/ProfileCard";
import { getCurrentUser } from "@/functions/db/auth";
import { Profile } from "@/types/db";

import SidebarLink from "./SidebarLink";
import Logo from "./Logo";
import LoginButton from "./auth/LoginButton";
import SidebarChatListLoader from "./sidebar/SidebarChatListLoader";
import { Suspense } from "react";
import SidebarChatListFallback from "./sidebar/SidebarChatListFallback";


export async function LeftSidebar() {
  let profile: Profile | undefined = undefined;
  try {
    profile = await getCurrentUser();
  } catch (e) {
    const err = e as Error;
    // Anons are allowed here, not an error
    if(err.message !== "No user found") {
      console.error("Error in LeftSidebar", e);
    };
  }

  const isLoggedIn = profile !== undefined;

  return (
    <Sidebar>
      <SidebarHeader className="p-2">
        <Logo hasLink className="p-2" />
        <SidebarGroup className="flex flex-col gap-2">
          <SidebarLink link="/" isLoggedIn={isLoggedIn} icon="explore" label="Explore" enableAnon />
          <SidebarLink link="/search" isLoggedIn={isLoggedIn} icon="search" label="Search" enableAnon />
          <SidebarLink link="/home" isLoggedIn={isLoggedIn} icon="home" label="Home" />
          <SidebarLink link={`/user/${profile?.user}/chats`} isLoggedIn={isLoggedIn} icon="chat" label="Your Chats" />
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent className="p-2">

        {profile !== undefined && 
        <>
          <SidebarGroupLabel className="text-lg font-bold">Chats</SidebarGroupLabel>
          <Suspense fallback={<SidebarChatListFallback />}>
            <SidebarChatListLoader />
          </Suspense>
        </>
        }

      </SidebarContent>

      <SidebarFooter className="w-full flex flex-col gap-2 items-start px-4 py-6">
        <LoginButton isLoggedIn={profile !== undefined} />        
        {profile !== undefined && <ProfileCard profile={profile} />}
      </SidebarFooter>

    </Sidebar>
    )
  }
  