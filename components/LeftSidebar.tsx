"use server";

import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Logo from "./Logo";
import dynamic from "next/dynamic";
import { Skeleton } from "./ui/skeleton";

const SidebarLink = dynamic(() => import ("./SidebarLink"), { loading: () => <Skeleton className="w-full h-full max-h-[48px]" />})
const LoginButton = dynamic(() => import ("./auth/LoginButton"), { loading: () => <Skeleton className="w-full h-full max-h-[48px]" />})
const ProfileCard = dynamic(() => import ("./user/ProfileCard"), { loading: () => <Skeleton className="w-full h-full max-h-[48px]" />})

export async function LeftSidebar() {
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

      <SidebarFooter className="w-full flex flex-col gap-2 items-start px-4 py-6">
        <LoginButton />    
        <ProfileCard />
      </SidebarFooter>

    </Sidebar>
    )
  }
  