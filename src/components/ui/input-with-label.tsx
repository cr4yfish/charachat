"use client";

import { memo, useMemo, useState } from "react";
import { Label } from "./label";
import { Input } from "./input";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type Props = {
    label?: string;
    id?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    optional?: boolean;
    required?: boolean;
    description?: string;
    disabled?: boolean;
}

const PureInputWithLabel = (props: Props) => {
    const [visible, setVisible] = useState(false);
    const toggleVisibility = () => {
        setVisible(!visible);
    }

    const inputType = useMemo(() => {
        if (props.type === "password" && !visible) {
            return "password";
        }   
        return "text";
    }, [props.type, visible]);

    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-col">
                <Label className="text-sm ">{props.label}</Label>
                {props.description && <p className="text-xs text-muted-foreground">{props.description}</p>}
            </div>
           
           <div className="relative">
                <Input 
                    id={props.id}
                    type={inputType}
                    placeholder={props.placeholder}
                    value={props.value}
                    onChange={props.onChange}
                    className={cn("py-6 rounded-2xl border-border text-sm", props.type === "password" && "pr-12")}
                    autoComplete="off"
                    disabled={props.disabled}
                />
                {props.type === "password" && (
                    <Button 
                        variant={"ghost"}
                        type="button" 
                        onClick={toggleVisibility} 
                        className="absolute right-2 top-1/2 rounded-2xl transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        disabled={props.disabled}
                    >
                        {visible ? <EyeOffIcon /> : <EyeIcon />}
                    </Button>
                )}
           </div>

            {props.optional && <p className="text-xs text-muted-foreground ">Optional</p>}
            {props.required && <p className="text-xs text-red-500">Required</p>}
        </div>
    )
}

export const InputWithLabel = memo(PureInputWithLabel, (prev, next) => {
    // Only re-render if label, id, or value changes
    if (prev.label !== next.label) return false;
    if (prev.id !== next.id) return false;
    if (prev.value !== next.value) return false;
    if (prev.placeholder !== next.placeholder) return false;
    if (prev.type !== next.type) return false;
    if (prev.description !== next.description) return false;
    if (prev.optional !== next.optional) return false;
    if (prev.required !== next.required) return false;
    if (prev.disabled !== next.disabled) return false;
    if (prev.onChange !== next.onChange) return false;


    return true;
})