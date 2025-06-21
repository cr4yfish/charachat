"use client";
import React, { memo, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from './label';

type Props = {
    value?: string;
    onChange?: (value: string) => void;
    maxLength: number;
    placeholder?: string;
    description?: string;
    label?: string;
    optional?: boolean;
    ref?: React.Ref<HTMLTextAreaElement>;
}

export const PureTextareaWithCounter = (props: Props) => {
    const [currentLength, setCurrentLength] = useState(props.value ? props.value.length : 0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if(!props.onChange) return;
        const newValue = e.target.value;
        if (newValue.length <= props.maxLength) {
            props.onChange(newValue);
            setCurrentLength(newValue.length);
        }
    };

    return (
        <div className="relative flex flex-col gap-1">

            <div className='flex flex-col'>
                {props.label && (
                    <Label className='text-sm '>{props.label}</Label>
                )}
                {props.description && (
                    <div className="text-xs text-muted-foreground">
                        {props.description}
                    </div>
                )}
            </div>

            <div className='relative'>
                <Textarea
                    value={props.value}
                    onChange={handleChange}
                    ref={props.ref}
                    className="resize-none pb-6 max-h-[250px] bg-black border-border "
                    rows={4}
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