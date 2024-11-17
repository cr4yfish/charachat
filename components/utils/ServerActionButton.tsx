"use client";


import { Button } from "@/components/utils/Button";
import React from "react";

export const ServerActionButton = React.forwardRef<
    React.ElementRef<typeof Button>, 
    React.ComponentPropsWithoutRef<typeof Button>
>(({ className, children, ...props }, ref) => {
    
    const [isLoading, setIsLoading] = React.useState(false);

    return (
        <Button 
            ref={ref}
            className={className}
            isLoading={isLoading}
            onClick={() => setIsLoading(true)}
            {...props}
        >
            {children}
        </Button>
    )
})