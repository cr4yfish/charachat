"use client";

import { cn } from "@/lib/utils"
import { memo } from "react"
import { Noise, } from "react-noise"
import { motion } from "motion/react";
import "react-noise/css";

export const GlobalLiquidFilter = () => {
    return (
        <svg className="hidden" >
            <filter id="liquid-distortion">
                <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves="2" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="77" />
            </filter>
        </svg>
    )
}

export const PureLiquid = (props: { children: React.ReactNode, className?: string, glassContentClassNames?: string }) => {

    return (
        <motion.div 
            layout
            className={cn(" liquid-card relative  border border-white/20 shadow-inner shadow-white/5 bg-white/10", props.className)}>
            <div className="liquid-filter "></div>
            <div className="liquid-overlay"></div>
            <div className="liquid-specular"></div>
            <Noise opacity={100} className="card-noise absolute size-full top-0 left-0 bg-transparent rounded-[inherit] " />

            <div className={cn("liquid-content", props.glassContentClassNames)}>
                {props.children}
            </div>
        </motion.div>
    )
    
}

PureLiquid.displayName = "Liquid";


export const Liquid = memo(PureLiquid);