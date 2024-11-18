import { Category } from "@/types/db"
import { Card, CardBody } from "@nextui-org/card"


type Props = {
    category?: Category,
    isButton?: boolean,
    onClick?: () => void,
    isSelected?: boolean
}

export default function CategoryCard(props: Props) {

    if(!props.category) return <></>

    return (
        <>
        <Card 
            isPressable={props.isButton}
            onClick={props.onClick}
            className={`
                max-w-[150px] w-fit px-4 py-2 rounded-full dark:bg-transparent 
                backdrop-blur-xl border-1 dark:border-zinc-600 shadow-none text-sm
                ${props.isSelected && "dark:bg-zinc-700"}
            `}
            >
            <CardBody className="p-0">
                {props.category.title}
            </CardBody>
        </Card>
        </>
    )
}