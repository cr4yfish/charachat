"use client";

import { memo, useState } from "react";
import { Switch } from "./switch";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

type Props = {
    className?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    label?: string | React.ReactNode;
    description?: string;
    optional?: boolean;
    disabled?: boolean;
}

export const PureBetterSwitch = (props: Props) => {
    const [internalChecked, setInternalChecked] = useState(props.checked || false);

    const handleCheckedChange = (checked: boolean) => {
        if (props.disabled) return;
        setInternalChecked(checked);
        props.onCheckedChange?.(checked);
    };

    return (
        <Card 
            onClick={() => handleCheckedChange(!internalChecked)}
            className={cn("flex flex-row justify-between px-3 py-3 items-center cursor-pointer bg-background/15", { " border-primary/50 ": internalChecked})}
            >
            <CardHeader className="flex flex-col gap-1 flex-1 p-0">
                <CardTitle>{props.label}</CardTitle>
                <CardDescription className="text-xs">{props.description}</CardDescription>
            </CardHeader>
            <CardContent className="w-fit flex justify-center items-end p-0">
                <Switch
                    disabled={props.disabled}
                    className={cn("", props.className)}
                    checked={internalChecked}
                    onCheckedChange={handleCheckedChange}
                >
                </Switch>
            </CardContent>
        </Card>
    );
}

export const BetterSwitch = memo(PureBetterSwitch, (prevProps, nextProps) => {
    if (prevProps.checked !== nextProps.checked) return false;
    if (prevProps.label !== nextProps.label) return false;
    if (prevProps.description !== nextProps.description) return false;
    if (prevProps.disabled !== nextProps.disabled) return false;
    if (prevProps.optional !== nextProps.optional) return false;
    if (prevProps.className !== nextProps.className) return false;
    if (prevProps.onCheckedChange !== nextProps.onCheckedChange) return false;

    return true;
});