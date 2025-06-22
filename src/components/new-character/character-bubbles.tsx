/**
 * Floating bubbles of existing character avatars
 */

"use client";

import { API_ROUTES } from "@/lib/apiRoutes";
import { fetcher, safeParseLink } from "@/lib/utils";
import useSWR from "swr";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "@/types/db";
import Image from "next/image";
import { TIMINGS_MILLISECONDS } from "@/lib/timings";

const Bubble = ({ char, index }: { char: Character, index: number }) => {
    const floatY = [-30, -10, -40, -20][index % 4];
    const floatX = [15, -15, 20, -20][index % 4];
    const duration = [3, 4, 5, 3.5][index % 4];


    return (
        <motion.div
          className="shrink-0 size-[24px] overflow-hidden rounded-full relative"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
                opacity: 1, 
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
                delay: index * 0.5
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
    const { data: chars } = useSWR<Character[]>(API_ROUTES.GET_CHARACTERS, fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: TIMINGS_MILLISECONDS.ONE_HOUR, 
    });

    return (
        <AnimatePresence>
            <div className="w-full h-[200px] flex flex-wrap items-center justify-center ">
                {chars?.map((char, index) => (
                    <Bubble key={char.id} char={char} index={index} />
                ))}
            </div>
        </AnimatePresence>
    )
}