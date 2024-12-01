import React from "react"
import Link from "next/link"

type Props = {
    children: React.ReactNode;
    href: string;
    active: boolean;
    target?: string;
    fullWidth?: boolean;
}

export default function ConditionalLink(props: Props) {
    if(props.active) {
        return (
            <Link
                className={props.fullWidth ? "w-full" : "w-fit"}
                href={props.href}
                target={props.target}
            >
                {props.children}
            </Link>
        )
    } else {
        return (
            <>
            {props.children}
            </>
        )
    }
}