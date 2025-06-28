"use client";

import Image from "next/image";
import { memo } from "react";
import { motion } from "motion/react";
import { safeParseLink } from "@/lib/utils/text";

const PureHeader = ({ image, name}: { image?: string, name?: string, role: string }) => {
    return (
        <div className="font-medium text-sm flex items-center gap-2">
            <div className="flex items-center gap-2 text-sky-100">
                {image && 
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                        className="rounded-full relative size-[20px] overflow-hidden"
                    >
                        <Image alt="" fill src={safeParseLink(image)} /> 
                    </motion.div>
                }
                <span>{name ?? "Charachat"}</span>
            </div>
        </div>
    );
}

export const Header = memo(PureHeader, (prev, next) => {
    if (prev.image !== next.image) return false;
    if (prev.name !== next.name) return false;
    if (prev.role !== next.role) return false;
    return true;
});
