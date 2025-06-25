"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { NavItem, tabs } from "./tab-bar/app-tabbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { BotIcon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import SidebarUser from "./sidebar-user";

const PureNavbarItem = (props: NavItem & { isActive?: boolean, sidebarOpen: boolean }) => {
  return (
    <SidebarMenuItem className={cn("flex items-center py-2 font-bold transition-all duration-150 ", 
        { "bg-primary text-primary-foreground": props.isActive },
        { "hover:bg-primary/10 ": !props.isActive },
        { "justify-center rounded-full ": !props.sidebarOpen },
        { "justify-start gap-2 py-2 px-2 rounded-3xl": props.sidebarOpen }
      )}>
      <SidebarMenuButton asChild>
        <Link href={props.href}>
          {props.icon}
          {props.sidebarOpen && <span>{props.name}</span>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export const NavbarItem = memo(PureNavbarItem, (prevProps, nextProps) => {
  return prevProps.href === nextProps.href && prevProps.isActive === nextProps.isActive
    && prevProps.sidebarOpen === nextProps.sidebarOpen && prevProps.name === nextProps.name;
});

export function AppSidebar() {
    const { isMobile, open } = useSidebar();
    const currentPath = usePathname();
    const { isSignedIn } = useAuth();

    // Disable sidebar on mobile devices
    if(isMobile) return null;

    return (
    <>
        <Sidebar collapsible={"icon"} variant={"floating"}>
            <SidebarHeader className="p-4 flex flex-row items-center gap-2">
                <BotIcon />
                <span className="font-bold">Charachat</span>
                {/* <SidebarToggle /> */}
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                <SidebarGroupLabel className="sr-only">Charachat</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu className="flex flex-col gap-2">
                        {tabs.map((item) => (
                            <NavbarItem
                                key={item.name}
                                name={item.name}
                                href={item.href}
                                icon={item.icon}
                                isActive={currentPath === item.href}
                                sidebarOpen={open}
                            />
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                  {isSignedIn && <SidebarUser />}

            </SidebarFooter>
        </Sidebar>
    </>
    )
}