"use client";

import { memo} from "react";
import { Button } from "../ui/button";
import { SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import ChatSettings from "./chat-settings";

type Props = {
    characterId?: string | undefined;
    chatId: string | undefined;
}

export const PureChatSettings = ({chatId}: Props) => {    

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant={"liquid"} className={cn("rounded-full w-fit bg-transparent ")} >
                    <SettingsIcon />
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-screen ios-safe-header-padding max-h-screen min-h-screen">
                <DrawerHeader>
                    <DrawerTitle className="w-full text-start">Chat Settings</DrawerTitle>
                </DrawerHeader>

                <DrawerFooter className="fixed bottom-0 left-0 w-full h-fit bg-gradient-to-t from-background via-background/75 to-background/0 pb-2 pt-3 flex justify-end">
                    <span className="text-xs text-muted-foreground">
                        {/* {(isLoading || isFetching) ? <div className="flex items-center gap-1"><Spinner /> <span>Saving changes...</span></div> : "All changes are saved automatically."} */}
                    </span>
                </DrawerFooter>

                <ChatSettings chatId={chatId} />

            </DrawerContent>
        </Drawer>
    )
}


export const ChatSettingsDrawer = memo(PureChatSettings, (prevProps, nextProps) => {    
    // Only re-render if chatId changes
    return prevProps.chatId === nextProps.chatId;
});