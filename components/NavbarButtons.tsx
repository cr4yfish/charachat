"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "./utils/Button";
import Icon from "./utils/Icon";
import FeedbackButton from "./FeedbackButton";

export default function NavbarButtons() {
    const pathname = usePathname();

    // Dont render in a chat page
    if(pathname.includes("/chat/")) return <></>

    return (
        <>
        {pathname !== "/c/new" &&
            <Link href={`/c/new`}>
                <Button radius="full" color="primary" startContent={<Icon filled>add</Icon>}>
                    Character
                </Button>
            </Link>
        }
         <FeedbackButton source={pathname} />
        </>
    )
}