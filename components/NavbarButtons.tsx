"use client";

import { usePathname } from "next/navigation";
import { Button } from "./utils/Button";
import Icon from "./utils/Icon";
import FeedbackButton from "./FeedbackButton";
import ConditionalLink from "./utils/ConditionalLink";
import { useLoginDialog } from "@/context/LoginDialogProvider";

export default function NavbarButtons() {
    const { openDialog, isLoggedIn } = useLoginDialog();
    const pathname = usePathname();

    // Dont render in a chat page
    if(pathname.includes("/chat/")) return <></>

    return (
        <>
        {pathname !== "/c/new" &&
            <ConditionalLink active={isLoggedIn} href={`/c/new`}>
                <Button onClick={() => {
                    if(!isLoggedIn) {
                        openDialog();
                    }
                }} radius="full" color="primary" startContent={<Icon filled>add</Icon>}>
                    Character
                </Button>
            </ConditionalLink>
        }
        <FeedbackButton source={pathname} />
        </>
    )
}