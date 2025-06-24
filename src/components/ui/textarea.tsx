"use client";

import * as React from "react"
import TextareaAutosize, { TextareaHeightChangeMeta } from 'react-textarea-autosize';

import { cn } from "@/lib/utils"
import { Liquid } from "./liquid";

function TextareaWithAutosize({ className, endContent, ...props }: React.ComponentProps<typeof TextareaAutosize> & { endContent?: React.ReactNode }) {
  const [hasMultipleRows, setHasMultipleRows] = React.useState(false);

  const handleHeightChange = (height: number, meta: TextareaHeightChangeMeta) => {
    console.log("Height changed:", height, meta);
    if(props.minRows === 1) {
      const singleRowHeight = 56
      console.log("Calculated height for single row:", singleRowHeight, { rowsHeight: meta.rowHeight, height, singleRowHeight, hasMultipleRows: height >= singleRowHeight });
      setHasMultipleRows(height > 56)
    }
  }

  return (
    <Liquid className={cn("size-full overflow-hidden", {
      "rounded-full": !hasMultipleRows,
      "rounded-3xl": hasMultipleRows,
    })}>
      <TextareaAutosize
        data-slot="textarea"
        onHeightChange={handleHeightChange}
        data-has-multiple-rows={hasMultipleRows}
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-[56px] size-full rounded-2xl border bg-transparent px-3 py-5 pt-3 text-base shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
      {endContent && (
        <div className="absolute bottom-0 right-0 h-full flex items-center justify-center pr-2 z-10 shrink-0">
          {endContent}
        </div>
      )}
    </Liquid>
  )
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-2xl border bg-transparent px-3 py-5 pt-3 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}


export { Textarea, TextareaWithAutosize }
