"use client";

import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { memo, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { TextareaWithCounter } from "../ui/textarea-with-counter";
import { useMessageEditDrawer } from "@/hooks/use-message-edit";

type CallbackProps = { newText: string, messageId: string }

type Props = {
    callback: (props: CallbackProps) => void;
}

const PureMessageEditDrawer = (props: Props) => {
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [internalText, setInternalText] = useState<string>("");
    const { editingMessage, isDrawerOpen, onOpenChange } = useMessageEditDrawer();

    // Update the internal text when a new message is selected for editing
    useEffect(() => {
        if (editingMessage && editingMessage.parts && editingMessage.parts.length > 0 && "text" in editingMessage.parts[0]) {
            setInternalText(editingMessage.parts[0]?.text || "");
        }
    }, [editingMessage]);

    const handleSave = async () => {
        if (!editingMessage) return;
        
        setIsSaving(true);
        try {
            props.callback({
                newText: internalText,
                messageId: editingMessage.id,
            });
            onOpenChange(false);
        } finally {
            setIsSaving(false);
        }
    }


    return (
        <Drawer open={isDrawerOpen} onOpenChange={onOpenChange}>
            <DrawerContent className="h-screen ios-safe-header-padding">
                <DrawerHeader>
                    <DrawerTitle>Message editor</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col px-4">
                    
                    <TextareaWithCounter
                        placeholder="Edit your message here..."
                        value={internalText}
                        onChange={setInternalText}
                        maxLength={5000}
                    />

                </div>
                <DrawerFooter>
                    <Button disabled={isSaving} onClick={handleSave}>
                        Save
                        {isSaving && <span className="ml-2 loading loading-spinner loading-sm"></span>}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export const MessageEditDrawer = memo(PureMessageEditDrawer, (prev, next) => {
    return prev.callback === next.callback;
});