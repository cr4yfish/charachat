"use client";

import Link from "next/link";
import { Avatar } from "@nextui-org/avatar";
import { useState } from "react";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator";
import ProfileCard from "@/components/user/ProfileCard";
import { Profile } from "@/types/db";
import { Button } from "./utils/Button";
import Icon from "./utils/Icon";
import { logout } from "@/functions/db/auth";
import ConditionalLink from "./utils/ConditionalLink";

type Props = {
    profile?: Profile
}

export default function Sidebar(props: Props) {

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
        window.location.reload();
    }

    return (
        <>
        <Sheet>
          <SheetTrigger>
            <Avatar size="md" src={props.profile?.avatar_link} />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="text-start">Hi, {props.profile ? props.profile.first_name : "Anon user"}</SheetTitle>
              <SheetDescription>

              </SheetDescription>
            </SheetHeader>

            <div className="h-full flex flex-col gap-2 justify-between pb-10">
            
              <div className="flex flex-col gap-4">
                <Separator orientation={"horizontal"} />
                <div className="flex flex-col gap-3">

                  <ConditionalLink active={props.profile !== undefined} href={`/user/${props.profile?.user}/chats`}>
                    <Button 
                      isDisabled={props.profile === undefined} 
                      fullWidth size="lg" 
                      variant="ghost" 
                      startContent={<Icon >chat</Icon>}
                    >
                      Your chats
                    </Button>
                  </ConditionalLink>

                  <ConditionalLink active={props.profile !== undefined} href={`/user/${props.profile?.user}/characters`}>
                    <Button 
                      isDisabled={props.profile === undefined} 
                      fullWidth size="lg" 
                      variant="ghost" 
                      startContent={<Icon >people</Icon>}
                    >
                      Your Characters
                    </Button>
                  </ConditionalLink>

                  <ConditionalLink active={props.profile !== undefined} href={`/user/${props.profile?.user}/stories`}>
                    <Button 
                      isDisabled={props.profile === undefined} 
                      fullWidth size="lg" 
                      variant="ghost" 
                      startContent={<Icon >book</Icon>}
                    >
                      Your Stories
                    </Button>
                  </ConditionalLink>

                </div>
        
              </div>
              <div className=" flex flex-col gap-4">
                <div className="w-full flex items-start">
                  <ProfileCard profile={props.profile}  />
                </div>
                <div className="flex flex-col gap-2">
                    {props.profile &&
                    <>
                      <Button 
                          color="warning" variant="flat" 
                          size="lg" 
                          isDisabled
                          startContent={<Icon filled>edit</Icon>}
                      >
                          Edit Profile
                      </Button>

                      <Button 
                          color="danger" variant="flat" 
                          size="lg" 
                          startContent={<Icon filled>logout</Icon>}
                          onClick={handleLogout}
                          isLoading={isLoggingOut}
                      >
                          Log out
                      </Button>
                      
                      </>
                    }

                    { props.profile === undefined &&
                      <Link href="/auth">
                        <Button 
                          color="primary" 
                          variant="shadow" 
                          size="lg" 
                          startContent={<Icon filled>login</Icon>}
                          fullWidth
                        >
                          Log in
                        </Button>
                      </Link>
                    }

                </div>

              </div>
              
            </div>
 
          </SheetContent>
        </Sheet>
        </>
    )
}