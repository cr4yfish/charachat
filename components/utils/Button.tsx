import React from "react"

const Button = React.forwardRef(({
    children,
    className,
    onClick,
    type,
    variant,
    size,
    isLoading,
    isDisabled,
    color,
    startContent,
    endContent,
    isIconOnly,
    fullWidth,
    radius,
    formAction,
    id,
    form

} : {
    children: React.ReactNode,
    className? : string | undefined,
    onClick? : () => void,
    type?: "button" | "submit" | "reset",
    variant?: "light" | "solid" | "bordered" | "flat" | "faded" | "shadow" | "ghost" | undefined,
    size?: "sm" | "md" | "lg" | undefined,
    isLoading?: boolean,
    isDisabled?: boolean,
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger",
    startContent?: React.ReactNode,
    endContent?: React.ReactNode,
    isIconOnly?: boolean,
    fullWidth?: boolean,
    radius?: "none" | "sm" | "md" | "lg" | "full" | undefined,
    formAction?: string | ((formData: FormData) => void | Promise<void>) | undefined,
    id?: string | undefined,
    form?: string | undefined
}, ref: React.ForwardedRef<HTMLButtonElement>) => {

    return (
        <button
            className={` font-black ${className}`}
            onClick={onClick}
            type={type}
            color={color}
            form={form}
            ref={ref}
            id={id}
        >
            {children}
        </button>
    )
})

Button.displayName = "Button"
export {Button};