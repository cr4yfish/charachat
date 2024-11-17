"use client";

import { usePathname } from "next/navigation";
import ConditionalLink from "./utils/ConditionalLink";
import { Button } from "./utils/Button";
import Icon from "./utils/Icon";

type SidebarLinkProps = {
    link: string;
    isLoggedIn: boolean;
    icon: string;
    label: string;
    radius?: "none" | "full" | "sm" | "md" | "lg";
    variant?: "light" | "solid" | "bordered" | "flat" | "faded" | "shadow" | "ghost"
  }
  

export default function SidebarLink(props: SidebarLinkProps): React.ReactNode {
    const pathname = usePathname();
    const isActive = pathname === props.link;

    return (
      <ConditionalLink active={props.isLoggedIn} href={props.link} >
        <Button 
          size="lg" 
          fullWidth
          isDisabled={!props.isLoggedIn}
          color={isActive ? "primary" : "default"}
          variant={isActive ? "solid" : "flat"}
          radius={props.radius || "sm"}
        >
            <div className="flex flex-row justify-start gap-2 w-full items-center">

                <Icon filled={isActive}>{props.icon}</Icon>
                {props.label}
          </div>
        </Button>
      </ConditionalLink>
    )
    
  }