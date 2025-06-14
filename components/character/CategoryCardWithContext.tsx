"use client";

import { Category } from "@/types/db"
import { Card, CardContent as CardBody } from "@/components/ui/card";
import { useCurrentCategory } from "@/context/CurrentCategoryProvider";

type Props = {
    data: Category,
}

export default function CategoryCardWithContext(props: Props) {

    const { currentCategory, setCurrentCategory } = useCurrentCategory();

    return (
        <>
        <Card 
            onClick={() => {
                setCurrentCategory(props.data)
            }}
            className={`
                w-full max-w-fit flex items-center justify-center px-4 py-3 rounded-full bg-zinc-200/50 dark:bg-zinc-600/40
                backdrop-blur-xl border-1 dark:border-none shadow-none text-sm font-medium
                ${(props.data.id == currentCategory?.id) ? "bg-white dark:bg-white dark:text-zinc-950" : "hover:bg-zinc-100 dark:hover:bg-zinc-700/40 dark:text-zinc-400"}
            `}
            >
            <CardBody className="p-0 w-full min-w-max h-full flex flex-row items-center justify-center">
                {props.data?.title}
            </CardBody>
        </Card>
        </>
    )
}