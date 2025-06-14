import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./label"

type ExtraProps = {
  label?: string,
  description?: string,
  onValueChange?: (value: string) => void,
  errorMessage?: string | null | boolean | undefined,
  isInvalid?: boolean,
  isRequired?: boolean,
}

const Input = React.forwardRef<
  HTMLInputElement, 
  React.ComponentProps<"input"> & ExtraProps
>(
  ({ className, type, label, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && <Label >{label}</Label>}
        {props.description && <p className="text-sm text-neutral-500">{props.description}</p>}
        {props.errorMessage && props.isInvalid && (
          <p className="text-sm text-red-500">{props.errorMessage}</p>
        )}
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-neutral-800 dark:file:text-neutral-50 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300",
            className
          )}
          ref={ref}
          onChange={(e) => {
            if (props.onValueChange) {
              props.onValueChange(e.target.value)
            }
          }}
          required={props.isRequired || props.required || false}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
