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
import LoginButtonServerWrapper from "./auth/LoginButtonServerWraper";

export async function LeftSidebar() {

  return (
    <Sidebar>
      <SidebarHeader className="p-2">
        <Logo hasLink className="p-2" />
        <SidebarGroup className="flex flex-col gap-2">
          <SidebarLink link="/"  icon="explore" label="Explore" enableAnon />
          <SidebarLink link="/search"  icon="search" label="Search" enableAnon />
          <SidebarLink link="/home" icon="home" label="Home" />
          <SidebarLink link={`/user/chats`} icon="chat" label="Your Chats" />
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroupLabel className="text-lg font-bold">Chats</SidebarGroupLabel>
        <Suspense fallback={<SidebarChatListFallback />}>
          <SidebarChatListLoader />
        </Suspense>
      </SidebarContent>

      <SidebarFooter className="w-full flex flex-col gap-2 items-start px-4 py-6">
        <Suspense fallback={<></>}>
          <LoginButtonServerWrapper />       
        </Suspense> 
        <ProfileCard />
      </SidebarFooter>

    </Sidebar>
    )
  }
  