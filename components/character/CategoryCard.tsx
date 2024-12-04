"use client";

import { Category } from "@/types/db"
import { Card, CardBody } from "@nextui-org/card"

type Props = {
    data?: Category | null,
    isButton?: boolean,
    onClick?: () => void,
    isSelected?: boolean
}

export default function CategoryCard(props: Props) {
    return (
        <>
        <Card 
            isPressable={props.isButton}
            onClick={props.onClick}
            className={`
                  w-full max-w-fit flex items-center justify-center px-4 py-3 rounded-full bg-zinc-200/70 dark:bg-zinc-600/40
                backdrop-blur-xl border-1 dark:border-none shadow-none text-sm font-medium
                ${props.isButton && "bg-zinc-100 dark:hover:bg-zinc-700/40"}
                ${props.isSelected && "bg-zinc-50 dark:text-zinc-950"}
            `}
            >
            <CardBody className="p-0 w-full min-w-max h-full flex flex-row items-center justify-center">
                {props.data?.title}
            </CardBody>
        </Card>
        </>
    )
}