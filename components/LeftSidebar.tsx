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
import SidebarLink from "./SidebarLink";
import Logo from "./Logo";
import SidebarChatListLoader from "./sidebar/SidebarChatListLoader";
import { Suspense } from "react";
import SidebarChatListFallback from "./sidebar/SidebarChatListFallback";
import LoginButton from "./auth/LoginButton";
import { getCurrentUser } from "@/functions/db/auth";

export async function LeftSidebar() {
  let isLoggedIn = false;

  try {
    const user = await getCurrentUser();
    if(user?.user) {
      isLoggedIn = true;
    }
  } catch {
    isLoggedIn = false;
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-2">
        <Logo hasLink className="p-2" />
        <SidebarGroup className="flex flex-col gap-2">
          <SidebarLink link="/"  icon="explore" label="Explore" enableAnon />
          <SidebarLink link="/search"  icon="search" label="Search" enableAnon />
          <SidebarLink link="/home" icon="home" label="Home" />
          <SidebarLink link={`/chats`} icon="chat" label="Your Chats" />
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroupLabel className="text-lg font-bold">Chats</SidebarGroupLabel>
        {isLoggedIn &&
        <Suspense fallback={<SidebarChatListFallback />}>
          <SidebarChatListLoader />
        </Suspense>
        }
      </SidebarContent>

      <SidebarFooter className="w-full flex flex-col gap-2 items-start px-4 py-6">
        <LoginButton />    
        <ProfileCard />
      </SidebarFooter>

    </Sidebar>
    )
  }
  