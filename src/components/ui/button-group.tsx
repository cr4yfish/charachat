import { memo, useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"

type Option = {
    value: string;
    label: string;
}

type Props = {
    value?: string | undefined;
    onValueChange?: (value: string) => void;
    options?: Option[];
    label?: string;
    description?: string;
    disabled?: boolean;
}

const PureButtonGroup = (props: Props) => {
    const [internalValue, setInternalValue] = useState(props.value || undefined);

    useEffect(() => {
        if (props.value !== undefined) {
            setInternalValue(props.value);
        }   
    }, [props.value]);

    const handleOnclick = (value: string) => {
        setInternalValue(value);
        if (props.onValueChange) {
            props.onValueChange(value);
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col">
                {props.label && <Label className="text-sm font-medium">{props.label}</Label>}
                {props.description && <p className="text-xs text-muted-foreground">{props.description}</p>}
            </div>
            <RadioGroup defaultValue="1" value={props.value} className="flex flex-row gap-1">
                {props.options?.map((option, index) => (
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
                                    className={cn("w-full !border-border ", {
                                        "rounded-l-3xl": index === 0,
                                        "rounded-r-3xl": index === props.options!.length - 1,
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


const ButtonGroup = memo(PureButtonGroup, (prevProps, nextProps) => {
    return prevProps.value === nextProps.value &&
        JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options) &&
        prevProps.disabled === nextProps.disabled &&
        prevProps.label === nextProps.label &&
        prevProps.description === nextProps.description;
})

export default ButtonGroup