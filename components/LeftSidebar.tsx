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


export async function LeftSidebar() {
  let chats: Chat[] = [];
  let profile: Profile | undefined = undefined;
  try {
    chats = await getChats();
    profile = await getCurrentUser();
  } catch (e) {
    console.error("Error in LeftSidebar", e);
  }

  const isLoggedIn = profile !== undefined;

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>

        <SidebarGroup>
          <h1 className="font-black text-lg">Charachat</h1>  
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarLink link="/" isLoggedIn={isLoggedIn} icon="explore" label="Explore" />
            <SidebarLink link={`/user/${profile?.user}/chats`} isLoggedIn={isLoggedIn} icon="chat" label="Your Chats" />
            <SidebarLink link={`/user/${profile?.user}/characters`} isLoggedIn={isLoggedIn} icon="people" label="Your Characters" />
            <SidebarLink link={`/user/${profile?.user}/stories`} isLoggedIn={isLoggedIn} icon="book" label="Your Stories" />
          </SidebarGroupContent>
        </SidebarGroup>


        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold">Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-col">
              {chats.slice(0,5).map((chat) => (
                <ChatCardSmall hasLink key={chat.id} chat={chat} />
              ))}
            
              {chats.length == 0 && (
                <div className=" w-full flex items-center justify-center pt-5">
                  <p className="text-sm dark:text-zinc-400">No chats yet</p>
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter className="w-full flex flex-col gap-2 items-start px-4 py-6">
        <ProfileCard profile={profile} />
      </SidebarFooter>
    </Sidebar>
    )
  }
  