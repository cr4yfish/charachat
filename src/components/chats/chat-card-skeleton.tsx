import { Skeleton } from "../ui/skeleton";
import { motion } from "motion/react";

export default function ChatCardSkeleton() {
    return (
        <motion.div
            className="w-full rounded-3xl overflow-hidden relative"
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: {
                        duration: 0.4,
                        ease: "easeOut"
                    }
                },
                exit: { 
                    opacity: 0, 
                    y: -20,
                    transition: {
                        duration: 0.3,
                        ease: "easeIn"
                    }
                }
            }}
            whileHover={{ scale: 1.01 }}
        >
            
            <div className="w-full h-[90px] rounded-3xl overflow-hidden relative shrink-0 bg-primary/10 p-4 flex flex-row gap-2">
                
                <Skeleton className="size-[56px] grow-0 shrink-0 rounded-full bg-primary/10" />
                
                <div className="flex flex-col w-full gap-1">
                    <Skeleton className="w-full h-[18px] bg-primary/10 rounded-3xl" />
                    <Skeleton className="w-3/4 h-[14px] bg-primary/10 rounded-3xl" />
                    <Skeleton className="w-1/2 h-[12px] bg-primary/10 rounded-3xl mt-1" />
                </div>
            </div>
        </motion.div>
    )
}