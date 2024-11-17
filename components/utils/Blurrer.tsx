"use client";

import { motion } from "motion/react";


export default function Blurrer() {

    return (
        <motion.div
            id="blurrer"
            className="absolute top-0 left-0 w-full h-full bg-black/5 backdrop-blur-2xl z-20 opacity-0 transition-all pointer-events-none select-none"
        />
    )
}