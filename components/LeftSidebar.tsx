"use server";

import { Button } from "./utils/Button";
import Icon from "./utils/Icon";

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
  

export async function LeftSidebar() {

  let chats: Chat[] = [];
  let profile: Profile | undefined = undefined;

  try {
    chats = await getChats();
    profile = await getCurrentUser();
  } catch (e) {
    console.error("Error in LeftSidebar", e);
  }

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>

        <SidebarGroup>
          <h1 className="font-black text-lg">Charachat</h1>  
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <Button 
              size="lg" 
              fullWidth
              startContent={<Icon>add</Icon>}
              radius="full"
            >
              New Character
            </Button>

            <Button 
              size="lg" 
              variant="flat"
              fullWidth
              startContent={<Icon filled>chat</Icon>}
            >
              Chats
            </Button>

            <Button 
              size="lg" 
              variant="flat"
              fullWidth
              startContent={<Icon filled>people</Icon>}
            >
              Characters
            </Button>

          </SidebarGroupContent>
        </SidebarGroup>


        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold">Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-col">
              {chats.slice(0,5).map((chat) => (
                <ChatCardSmall hasLink key={chat.id} chat={chat} />
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter className="w-full flex items-start px-4 py-6">
        <ProfileCard profile={profile} />
      </SidebarFooter>
    </Sidebar>
    )
  }
  