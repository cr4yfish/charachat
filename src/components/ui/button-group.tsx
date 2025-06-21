"use client"

import { memo, useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"
import equal from "fast-deep-equal"

type Option = {
    value: string;
    label: string;
    disabled?: boolean;
}

type Props = {
    value?: string | undefined;
    onValueChange?: (value: string) => void;
    options?: Option[];
    label?: string;
    description?: string;
    disabled?: boolean;
    dir?: "vertical" | "horizontal";
}

const PureButtonGroup = ({ value, onValueChange, options, label, description, dir="horizontal" }: Props) => {
    const [internalValue, setInternalValue] = useState(value || undefined);

    useEffect(() => {
        if (value !== undefined) {
            setInternalValue(value);
        }   
    }, [value]);

    const handleOnclick = (value: string) => {
        setInternalValue(value);
        if (onValueChange) {
            onValueChange(value);
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col">
                {label && <Label className="text-sm font-medium">{label}</Label>}
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            <RadioGroup defaultValue="1" value={value} className={cn("flex flex-row gap-1", {
                "flex-col": dir === "vertical",
            })}>
                {options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 flex-1">
                        <RadioGroupItem value={option.value} className=" sr-only" id={option.value} />
                        <Label htmlFor={option.value} className="flex-1">
                            <motion.div
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 700, damping: 15 }}
                                className="w-full"
                            >
                                <Button
                                    variant={"outline"}
                                    disabled={option.disabled}
                                    className={cn("w-full !border-border ", {
                                        "rounded-l-3xl": index === 0 && dir === "horizontal",
                                        "rounded-r-3xl": index === options!.length - 1 && dir === "horizontal",
                                        "rounded-lg !bg-primary text-primary-foreground ": internalValue === option.value
                                    })}
                                    onClick={() => handleOnclick(option.value)}
                                >
                                    {option.label}
                                </Button>
                            </motion.div>
                        </Label>        
                    </div>
                ))}
                
            </RadioGroup>
        </div>
    )
}


const ButtonGroup = memo(PureButtonGroup, (prev, next) => {
    if(prev.value !== next.value) return false;
    if(prev.disabled !== next.disabled) return false;
    if(prev.label !== next.label) return false;
    if(prev.description !== next.description) return false;
    if(prev.dir !== next.dir) return false;
    if(!equal(prev.options, next.options)) return false;
    
    return true;
})

export default ButtonGroup