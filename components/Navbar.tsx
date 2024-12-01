"use client";

import { Spacer } from "@nextui-org/spacer";
import { usePathname } from "next/navigation";

import { SidebarTrigger } from "./ui/sidebar";
import Link from "next/link";
import LoginButton from "./auth/LoginButton";
import { Profile } from "@/types/db";
import Logo from "./Logo";
import { Button } from "./utils/Button";
import Icon from "./utils/Icon";
import FeedbackButton from "./FeedbackButton";

type Props = {
    profile?: Profile;
}

export default function Navbar(props: Props) {
    const pathname = usePathname();

    // Dont render in a chat page
    if(pathname.includes("/chat/")) return <></>

    return (
        <>
        <div className="absolute top-0 left-0 w-full flex flex-row items-center justify-between px-4 pt-3 pb-2 backdrop-blur z-50">
            <div className="flex items-center gap-2">
                <SidebarTrigger><></></SidebarTrigger>
                <Link href={"/"}><Logo hideTextOnMobile /></Link>
            </div>

            <LoginButton isLoggedIn={props.profile !== undefined} isSmall />

            {props.profile !== undefined &&
            <div className="flex items-center gap-2">
                <FeedbackButton source={pathname} />
                <Link href={`/c/new`}>
                    <Button radius="full" color="primary" startContent={<Icon filled>add</Icon>}>
                        Character
                    </Button>
                </Link>
            </div>
            }
        </div>

        <Spacer y={12} />
        </>
    )
}