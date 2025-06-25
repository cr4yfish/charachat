/**
 * Floating bubbles of existing character avatars
 */

"use client";

import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { fetcher } from "@/lib/utils";
import { safeParseLink } from "@/lib/utils/text";
import useSWR from "swr";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "@/lib/db/types/character";
import Image from "next/image";
import { TIMINGS_MILLISECONDS } from "@/lib/constants/timings";

const Bubble = ({ char, index, totalCount }: { char: Character, index: number, totalCount: number }) => {
    const floatY = [-30, -10, -40, -20][index % 4];
    const floatX = [15, -15, 20, -20][index % 4];
    const duration = [3, 4, 5, 3.5][index % 4];

    // Calculate position for even distribution across the screen with some randomness
    const baseX = (index / Math.max(totalCount - 1, 1)) * 90 + 5; // 5% to 95% across screen
    const randomOffsetX = (index * 17) % 20 - 10; // -10 to +10 offset
    const screenX = Math.max(2, Math.min(96, baseX + randomOffsetX));
    
    const layerY = 15 + (index % 4) * 20; // 4 different Y layers
    const randomOffsetY = (index * 23) % 15 - 7; // -7 to +7 offset
    const screenY = Math.max(5, Math.min(85, layerY + randomOffsetY));

    return (
        <motion.div
          className="shrink-0 size-[24px] overflow-hidden rounded-full absolute pointer-events-none"
          style={{
            left: `${screenX}%`,
            top: `${screenY}%`,
          }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
                opacity: .8, 
                scale: 1,
                y: [0, floatY, 0],
                x: [0, floatX, 0]
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
                duration: duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: index * 0.1
            }}
        >
            <Image 
                src={safeParseLink(char.image_link)} 
                alt="" 
                fill
                className="object-cover size-full" 
            />
        </motion.div>
    );
}

export default function CharacterBubbles() {
    const { data: chars } = useSWR<Character[]>(API_ROUTES.GET_CHARACTERS + "?limit=100", fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: TIMINGS_MILLISECONDS.ONE_HOUR, 
    });    

    return (
        <AnimatePresence>
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                {chars?.map((char, index) => (
                    <Bubble key={char.id} char={char} index={index} totalCount={chars.length} />
                ))}
            </div>
        </AnimatePresence>
    )
}