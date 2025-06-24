"use client";
import React, { memo, useState, useCallback, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from './label';
import { cn } from '@/lib/utils';

const PureHeader = ({ label, description}: { label?: string | undefined, description?: string | undefined }) => {
    return (
        <div className='flex flex-col'>
            {label && (
                <Label className='text-sm '>{label}</Label>
            )}
            {description && (
                <div className="text-xs text-muted-foreground">
                    {description}
                </div>
            )}
        </div>
    );
}

const Header = memo(PureHeader, (prevProps, nextProps) => {
    return prevProps.label === nextProps.label &&
           prevProps.description === nextProps.description;
});


type Props = {
    value?: string;
    onChange?: (value: string) => void;
    maxLength: number;
    placeholder?: string;
    description?: string;
    label?: string;
    optional?: boolean;
    ref?: React.Ref<HTMLTextAreaElement>;
    noResize?: boolean;
    rows?: number;
    height?: number; // Optional height prop, not used in the component but can be passed
    name?: string; // Optional name prop, not used in the component but can be passed
    disabled?: boolean; // Optional disabled prop, not used in the component but can be passed
}

export const PureTextareaWithCounter = (props: Props) => {
    const { onChange, maxLength, value } = props;
    const [currentLength, setCurrentLength] = useState(value ? value.length : 0);

    // Sync currentLength with value prop changes
    useEffect(() => {
        setCurrentLength(value ? value.length : 0);
    }, [value]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if(!onChange) return;
        const newValue = e.target.value;
        if (newValue.length <= maxLength) {
            onChange(newValue);
            setCurrentLength(newValue.length);
        }
    }, [onChange, maxLength]);

    return (
        <div className="relative flex flex-col gap-1 h-full">

            <Header label={props.label} description={props.description} />

            <div className='relative h-full'>
                <Textarea
                    value={props.value}
                    name={props.name || props.label?.toLowerCase().replace(/\s+/g, '-') || 'textarea'}
                    id={props.name  || props.label?.toLowerCase().replace(/\s+/g, '-') || 'textarea'}
                    onChange={handleChange}
                    ref={props.ref}
                    className={cn("pb-6 h-full bg-black border-border max-h-[250px]", props.noResize ? "resize-none" : "resize-y")}
                    rows={props.rows || 4}
                    maxLength={props.maxLength}
                    placeholder={props.placeholder || "Type your message here..."}
                />
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground  bg-background/80 rounded-xl p-1 z-10 backdrop-blur-xl">
                    {currentLength.toLocaleString()} / {props.maxLength.toLocaleString()}
                </div>
            </div>
            {props.optional && (
                <div className="text-xs text-muted-foreground mt-1">
                    (Optional)
                </div>
            )}

        </div>
    );
}

export const TextareaWithCounter = memo(PureTextareaWithCounter, (prevProps, nextProps) => {
    return prevProps.value === nextProps.value &&
            prevProps.maxLength === nextProps.maxLength &&
            prevProps.placeholder === nextProps.placeholder && 
            prevProps.description === nextProps.description &&
            prevProps.label === nextProps.label &&
            prevProps.optional === nextProps.optional &&
            prevProps.onChange === nextProps.onChange &&
            prevProps.ref === nextProps.ref;
});