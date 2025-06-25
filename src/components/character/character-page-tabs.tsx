import { Character } from "@/lib/db/types/character";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Markdown from "react-markdown";

type Props = {
    character: Character;
}

export default function CharacterPageTabs(props: Props) {

    return (
        <>
        {props.character.hide_definition ?
            <div className=" w-[500px] relative">
                <p>This Character&apos;s definition is hidden.</p>
            </div>
        :
        <div className="w-full flex justify-start items-start flex-col dark:prose-invert prose-p:text-sm dark:prose-p:text-zinc-400 prose-h3:mt-0 prose-h2:m-0 prose-hr:m-0 !select-none">

            <Accordion collapsible type="single" defaultValue="bio" className="w-full prose-h2:m-0">

                {props.character.bio && 
                <AccordionItem value="bio" title="Bio" className="prose-h2:m-0 prose-p:m-0">
                    <AccordionTrigger className="cursor-pointer">
                        <h2 className="text-lg font-bold">Bio</h2>
                    </AccordionTrigger>
                    <AccordionContent className="dark:prose-invert prose-p:m-0">
                        <Markdown>{props.character.bio}</Markdown>
                    </AccordionContent>
                </AccordionItem>}

                {props.character.intro && 
                <AccordionItem value="introduction" title="Introduction" className="prose-h2:m-0 prose-p:m-0">
                    <AccordionTrigger className="cursor-pointer">
                        <h2 className="text-lg font-bold">Introduction</h2>
                    </AccordionTrigger>
                    <AccordionContent className="dark:prose-invert prose-p:m-0">
                        <Markdown>{props.character.intro}</Markdown>
                    </AccordionContent>
                </AccordionItem>
                }

                {props.character.personality && 
                <AccordionItem value="personality" title="Personality" className="prose-h2:m-0 prose-p:m-0">
                    <AccordionTrigger className="cursor-pointer">
                        <h2 className="text-lg font-bold">Personality</h2>
                    </AccordionTrigger>
                    <AccordionContent className="dark:prose-invert prose-p:m-0">
                        <Markdown>{props.character.personality}</Markdown>
                    </AccordionContent>
                </AccordionItem>
                }

                {props.character.scenario && 
                <AccordionItem value="scenario" title="Scenario" className="prose-h2:m-0 prose-p:m-0">
                    <AccordionTrigger className="cursor-pointer">
                        <h2 className="text-lg font-bold">Scenario</h2>
                    </AccordionTrigger>
                    <AccordionContent className="dark:prose-invert prose-p:m-0">
                        <Markdown>{props.character.scenario}</Markdown>
                    </AccordionContent>
                </AccordionItem>
                }

                {props.character.first_message && 
                <AccordionItem value="firstmessage" title="First Message" className="prose-h2:m-0 prose-p:m-0">
                    <AccordionTrigger className="cursor-pointer">
                        <h2 className="text-lg font-bold">First Message</h2>
                    </AccordionTrigger>
                    <AccordionContent className="dark:prose-invert prose-p:m-0">
                        <Markdown>{props.character.first_message}</Markdown>
                    </AccordionContent>
                </AccordionItem>
                }

                {props.character.book && 
                <AccordionItem value="book" title="Character Book" className="prose-h2:m-0 prose-p:m-0">
                    <AccordionTrigger className="cursor-pointer">
                        <h2 className="text-lg font-bold">Character Book</h2>
                    </AccordionTrigger>
                    <AccordionContent className="dark:prose-invert prose-p:m-0">
                        <Markdown>{props.character.book}</Markdown>
                    </AccordionContent>
                </AccordionItem>
                }

                {props.character.system_prompt && 
                <AccordionItem value="systemprompt" title="System Prompt" className="prose-h2:m-0 prose-p:m-0">
                    <AccordionTrigger className="cursor-pointer">
                        <h2 className="text-lg font-bold">System Prompt</h2>
                    </AccordionTrigger>
                    <AccordionContent className="dark:prose-invert prose-p:m-0">
                        <Markdown>{props.character.system_prompt}</Markdown>
                    </AccordionContent>
                </AccordionItem>
                }

                {props.character.image_prompt && 
                <AccordionItem value="imageprompt" title="Image Prompt" className="prose-h2:m-0 prose-p:m-0">
                    <AccordionTrigger className="cursor-pointer">
                        <h2 className="text-lg font-bold">Image Prompt</h2>
                    </AccordionTrigger>
                    <AccordionContent className="dark:prose-invert prose-p:m-0">
                        <Markdown>{props.character.image_prompt}</Markdown>
                    </AccordionContent>
                </AccordionItem>
                }

            </Accordion>

        </div>
        }
        </>
    )
}