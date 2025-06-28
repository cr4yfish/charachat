import { Message as MessageType } from "ai";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyIcon, EditIcon, ImageIcon,TrashIcon, VolumeIcon } from "lucide-react";
import { motion } from "motion/react";
import { _INTRO_MESSAGE_PLACEHOLDER } from "@/lib/constants/defaults";
import equal from 'fast-deep-equal';
import { getMessageIdFromAnnotations } from "@/lib/utils/message";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { toast } from "sonner";

import { useMessageEdit } from "@/hooks/use-message-edit";


const PureFooter = (props: { openImageGen?: () => void; message: MessageType, chatId?: string, deleteCallback?: (messageId: string) => void }) => {
    const [state, setState] = useState<"init" | "deleting" | "editing" | "copying" | "generating-image" | "listening">("init");
    const { openMessageEdit } = useMessageEdit();

    const handleEditMessage = () => {
        openMessageEdit(props.message);
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2"
        >
            {/* <ClockIcon className="size-[12px]" /> */}
            {/* {prettyPrintDate(new Date())} */}
            
            {/* Editing only available in a chat */}
            {props.chatId &&
            <Button onClick={handleEditMessage} size={"icon"} variant={"ghost"} >
                <EditIcon color="currentColor" />
            </Button>
            }

            {props.deleteCallback && 
            <Button 
                disabled={state === "deleting"}
                size={"icon"} 
                variant={"ghost"} 
                onClick={async () => {
                    const messageId = getMessageIdFromAnnotations(props.message);
                
                    setState("deleting");
                    const deleteResponse = fetch(API_ROUTES.DELETE_MESSAGE + messageId + "&chatId=" + props.chatId, {
                        method: "DELETE"
                    }).finally(() => {
                        setState("init");
                    });

                    toast.promise(deleteResponse, {
                        loading: "Deleting message...",
                        success: () => {
                            props.deleteCallback?.(messageId);
                            return "Message deleted successfully.";
                        },
                        error: "Failed to delete message."
                    });
                }}
            >
                {state === "deleting" ? 
                    <span className="animate-spin"> 
                        <TrashIcon color="currentColor" />
                    </span>
                    :
                    <TrashIcon color="currentColor" />
                }
            </Button>
            }

            <Button size={"icon"} variant={"ghost"} onClick={() => {
                setState("copying");
                navigator.clipboard.writeText(props.message.content).finally(() => {
                    toast.success("Message copied to clipboard: ", {
                        duration: 3000,
                        description: "You can use this ID to reference the message in the future."
                    });
                    setState("init");
                });
            }} >
                {state === "copying" ? 
                    <span className="animate-spin"> 
                        <CopyIcon color="currentColor" />
                    </span>
                    :
                    <CopyIcon color="currentColor" />
                }
            </Button>

            {props.openImageGen && 
            <Button onClick={props.openImageGen} size={"icon"} variant={"ghost"} >
                <ImageIcon color="currentColor" />
            </Button>
            }

            {/* Voice only available with a chat */}
            {props.chatId &&
            <Button disabled size={"icon"} variant={"ghost"} >
                <VolumeIcon color="currentColor" />
            </Button>
            }
            
        </motion.div>
 
    )
}

export const Footer = memo(PureFooter, (prev, next) => {
    if (prev.openImageGen !== next.openImageGen) return false;
    if (!equal(prev.message, next.message)) return false;
    return true;
});