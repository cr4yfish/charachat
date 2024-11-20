"use server";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
  } from "@/components/ui/sidebar"
import { getChats } from "@/functions/db/chat";
import ChatCardSmall from "./chat/ChatCardSmall";
import ProfileCard from "./user/ProfileCard";
import { getCurrentUser } from "@/functions/db/auth";
import { Chat, Profile } from "@/types/db";

import SidebarLink from "./SidebarLink";
import LoginButton from "./auth/LoginButton";
import Logo from "./Logo";
import Link from "next/link";
import InfiniteListLoader from "./InfiniteListLoader";


export async function LeftSidebar() {
  let chats: Chat[] = [];
  let profile: Profile | undefined = undefined;
  try {
    chats = await getChats(0, 15);
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
      <SidebarHeader />
      <SidebarContent>

        <SidebarGroup>
          <Link href={"/"}><Logo /></Link>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarLink link="/" isLoggedIn={isLoggedIn} icon="explore" label="Explore" enableAnon />
            <SidebarLink link={`/user/${profile?.user}/chats`} isLoggedIn={isLoggedIn} icon="chat" label="Your Chats" />
            <SidebarLink link={`/user/${profile?.user}/characters`} isLoggedIn={isLoggedIn} icon="people" label="Your Characters" />
            <SidebarLink link={`/user/${profile?.user}/stories`} isLoggedIn={isLoggedIn} icon="book" label="Your Stories" />
            <SidebarLink link={`https://github.com/cr4yfish/charachat`} isLoggedIn={isLoggedIn} icon="open_in_new" label="GitHub" isExternal />
          </SidebarGroupContent>
        </SidebarGroup>


        {profile !== undefined && 
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold">Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <InfiniteListLoader 
              initialData={chats}
              loadMore={getChats}
              limit={5}
              component={ChatCardSmall}
              componentProps={{hasLink: true}}
            />
          </SidebarGroupContent>
        </SidebarGroup>
        }

      </SidebarContent>
      <SidebarFooter className="w-full flex flex-col gap-2 items-start px-4 py-6">
        <LoginButton 
            isLoggedIn={profile !== undefined} 
            showLogout 
        />
        {profile !== undefined && <ProfileCard profile={profile} />}
      </SidebarFooter>
    </Sidebar>
    )
  }
  