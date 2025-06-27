import { cn } from "@/lib/utils";

type Props = {
    size?: "small" | "medium" | "large";
}

export default function Spinner(props: Props) {
    // return (
    //     <div className={cn("size-3 animate-spin rounded-full border-2 border-solid border-current border-t-transparent", {
    //         "size-2": props.size === "small",
    //         "size-3": props.size === "medium",
    //         "size-4": props.size === "large"
    //     })}
    //     ></div>
    // )
    return (
        <div className={cn("animate-spin rounded-full size-2 border-b-2 border-primary", {
            "size-2": props.size === "small",
            "size-3": props.size === "medium",
            "size-4": props.size === "large"
        })}>

        </div>
    )
}