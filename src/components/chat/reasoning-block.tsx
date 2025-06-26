'use client';

import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@radix-ui/react-accordion";
import { ChevronsUpDown } from "lucide-react";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any;
}

export function ReasoningBlock({
  children
}: Props) {

  return (
    <Accordion type="single" collapsible>
        <AccordionItem value="reasoning">
            <AccordionTrigger asChild>
                <Button variant={"ghost"}>
                    🧠 Reasoning
                    <ChevronsUpDown/>
                </Button>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 mt-2 border-l-2 pl-2 text-sm italic ">
                {children}
            </AccordionContent>
        </AccordionItem>
    </Accordion>
  )
}
