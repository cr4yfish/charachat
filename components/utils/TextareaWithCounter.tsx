"use client";

import { useState } from "react"
import { Textarea } from "@nextui-org/input"

type Props = {
    value?: string;
    onValueChange?: (value: string) => void;
    maxLength: number;
    name?: string;
    label: string;
    placeholder?: string;
    description?: string;
    isRequired?: boolean;
    minRows?: number;
    maxRows?: number;
}

export default function TextareaWithCounter(props: Props) {
    const [value, setValue] = useState(props.value ?? "");

    return (
        <>
        <Textarea
            name={props.name}
            label={props.label}
            placeholder={props.placeholder}
            description={props.description}
            isRequired={props.isRequired}
            maxLength={props.maxLength}
            minRows={props.minRows}
            maxRows={props.maxRows}
            value={props.value}
            onValueChange={(value) => {
                setValue(value);
                if(props.onValueChange) props.onValueChange(value);
            }}
            endContent={<span className="text-xs dark:text-slate-400 self-end ">{value.length}/{props.maxLength}</span>}
            classNames={{
                innerWrapper: "flex flex-col justify-center",
            }}
        />
        </>
    )
}