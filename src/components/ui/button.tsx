import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Liquid } from "./liquid"

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
           "rounded-3xl overflow-hidden relative h-fit min-h-[48px] w-full",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 py-4 min-h-[48px]",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 py-4 min-h-[48px]",
        secondary:
          "bg-primary text-primary-foreground hover:bg-primary/80 backdrop-blur-lg rounded-3xl py-4 min-h-[48px]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 rounded-3xl py-4 min-h-[36px] backdrop-blur-lg ",
        link: "text-primary underline-offset-4 hover:underline py-4 min-h-[48px]",
        liquid: "rounded-3xl overflow-hidden relative h-fit min-h-[48px] w-full",
      },
      size: {
        default: "h-9 px-4 py-4 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

    if(variant=== "liquid" || variant === undefined || variant === "default" || variant === null) {
      return (
        <Liquid className={cn(buttonVariants({ variant, size, className }))} glassContentClassNames="size-full cursor-pointer" >
          <Comp 
            data-slot="button"
            className="w-full h-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
            {...props}
          />
        </Liquid>
      )
    }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
