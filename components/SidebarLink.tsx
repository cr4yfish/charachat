"use client";

import { usePathname } from "next/navigation";
import ConditionalLink from "./utils/ConditionalLink";
import { Button } from "./utils/Button";
import Icon from "./utils/Icon";
import React, { useEffect } from "react";
import { Spinner } from "@nextui-org/spinner";
import { useLoginDialog } from "@/context/LoginDialogProvider";

type SidebarLinkProps = {
    link: string;
    icon: string;
    label: string;
    radius?: "none" | "full" | "sm" | "md" | "lg";
    variant?: "light" | "solid" | "bordered" | "flat" | "faded" | "shadow" | "ghost",
    enableAnon?: boolean;
    isExternal?: boolean;
}

export default function SidebarLink(props: SidebarLinkProps): React.ReactNode {
    const pathname = usePathname();
    const { isLoggedIn } = useLoginDialog();
    const [isActive , setIsActive] = React.useState(pathname === props.link);
    const [isLoading, setIsLoading] = React.useState(false);

    useEffect(() => {
      setIsActive(pathname === props.link);
    }, [props.link, pathname])

    return (
      <ConditionalLink fullWidth active={((props.enableAnon || isLoggedIn) ?? false)} href={props.link} target={props.isExternal ? "_blank" : undefined} >
        <Button 
          size="lg" 
          fullWidth
          isDisabled={!(props.enableAnon || isLoggedIn) || isLoading}
          color={isActive ? "primary" : "default"}
          onClick={() => {
            if(props.isExternal) return;
            setIsLoading(true)
          }}
          variant={isActive ? "solid" : "flat"}
          radius={props.radius || "sm"}
          className={`
            dark:bg-zinc-800/50 ${isActive && "dark:bg-primary"}
          `}
        >
            <div className="flex flex-row justify-between gap-2 w-full items-center">
                <div className={`
                  flex flex-row justify-start gap-2 w-full items-center
                  ${!isActive && "text-zinc-400"}  
                `}>
                  <Icon filled={isActive}>{props.icon}</Icon>
                  {props.label}
                </div>
                {isLoading && <Spinner size="sm" color="primary" />}
          </div>
        </Button>
      </ConditionalLink>
    )
    
  }