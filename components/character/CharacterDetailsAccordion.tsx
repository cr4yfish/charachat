"use client";


import { Character } from "@/types/db";

type Props = {
    character: Character
}

export default function CharacterDetailsAccordion(props: Props) {

    return (
        <>
        <Accordion>
            <AccordionItem key="2" aria-label="Character Intro" title="Character Intro">
                <p className="dark:prose-invert break-words">{props.character?.intro || "This character has no intro."}</p>
            </AccordionItem>
            <AccordionItem key="1" aria-label="Character Book" title="Character Book" subtitle="Warning: long">
                <p className="dark:prose-invert break-words">{props.character?.book || "This character has no book."}</p>
            </AccordionItem>
        </Accordion>
        </>
    )
}