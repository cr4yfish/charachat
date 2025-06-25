"use client";
import React, { memo, useState, useCallback, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { truncateNumber } from '@/lib/utils/text';
import { Button } from './button';
import { SparkleIcon } from 'lucide-react';
import { API_ROUTES } from '@/lib/constants/apiRoutes';
import { toast } from 'sonner';
import Spinner from './spinner';

const PureHeader = ({ label, description}: { label?: string | undefined, description?: string | undefined }) => {
    return (
        <div className='flex flex-col gap-1'>
            {label && (
                <Label className='text-xs text-white/90 '>{label}</Label>
            )}
            {description && (
                <div className="text-xs text-muted-foreground/75">
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
    ai?: {
        prompt?: string;
    }
}

export const PureTextareaWithCounter = (props: Props) => {
    const { onChange, maxLength, value } = props;
    const [currentLength, setCurrentLength] = useState(value ? value.length : 0);
    const [isGenerating, setIsGenerating] = useState(false);

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

    const handleGenerate = useCallback(() => {
        setIsGenerating(true);
        // Placeholder for generate functionality

        if(!props.ai?.prompt) {
            toast.error("Please provide a prompt and input text.");
            setIsGenerating(false);
            return;
        }
        const prom = fetch(API_ROUTES.AUTHOR, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: props.ai?.prompt || "",
                input: value || ""
            })
        }).finally(() => {
            setIsGenerating(false);
        })

        toast.promise(prom, {
            loading: "Generating...",
            success: async (res) => {
                if(!res.ok) {
                    throw new Error("Failed to generate content.");
                }

                const data = await res.json();
                if(!data.result) {
                    throw new Error("No result returned from generation.");
                }
                onChange?.(data.result);

                setIsGenerating(false);
                return "Generated successfully!";
            },
            error: (err) => {
                setIsGenerating(false);
                console.error("Error generating:", err);
                return "Failed to generate. Please try again.";
            }
        });

    }, [props.ai?.prompt, value, onChange]);

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
                    className={cn("pb-6 h-full bg-black border-border max-h-[250px] text-sm md:text-base", props.noResize ? "resize-none" : "resize-y")}
                    rows={props.rows || 4}
                    maxLength={props.maxLength}
                    placeholder={props.placeholder || "Type your message here..."}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 rounded-xl p-1 z-10 backdrop-blur-xl">
                    {props.ai?.prompt &&
                        <Button disabled={isGenerating} onClick={handleGenerate} size={"icon"} variant={"ghost"} className='size-[10px]'>
                            {isGenerating ? <Spinner size='small' /> :<SparkleIcon size={5} className='!size-[12px]' />}
                        </Button>
                    }
                    <span className=''>
                        {truncateNumber(currentLength)} / {truncateNumber(props.maxLength)}
                    </span>
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