"use client";

import { Category } from "@/types/db"
import { Card, CardBody } from "@nextui-org/card"

import { useCurrentCategory } from "@/context/CurrentCategoryProvider";

type Props = {
    data: Category,
}

export default function CategoryCardWithContext(props: Props) {

    const { currentCategory, setCurrentCategory } = useCurrentCategory();

    return (
        <>
        <Card 
            isPressable
            onClick={() => {
                setCurrentCategory(props.data)
            }}
            className={`
                w-full max-w-fit flex items-center justify-center px-4 py-3 rounded-full dark:bg-zinc-600/40
                backdrop-blur-xl border-1 dark:border-none shadow-none text-sm font-medium
                dark:hover:bg-zinc-700/40
                ${(props.data.id == currentCategory?.id) && "dark:bg-white dark:text-zinc-950"}
            `}
            >
            <CardBody className="p-0 w-full min-w-max h-full flex flex-row items-center justify-center">
                {props.data?.title}
            </CardBody>
        </Card>
        </>
    )
}