import React from "react"
import Link from "next/link"

export default function ConditionalLink({ children, href, active, target } : { children: React.ReactNode, href: string, active: boolean, target?: string }) {
    if(active) {
        return (
            <Link
                className="w-fit"
                href={href}
                target={target}
            >
                {children}
            </Link>
        )
    } else {
        return (
            <>
            {children}
            </>
        )
    }
}