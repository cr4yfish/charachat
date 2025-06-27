import { Character } from "@/lib/db/types/character";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Markdown from "react-markdown";

const AccordionSection = ({ title, description, content }: { title: string, description: string, content: string }) => {

    return (
        <AccordionItem value={title} title={title} className="prose-h2:m-0 prose-p:m-0">
            <AccordionTrigger className="cursor-pointer">
                <div className="flex flex-col gap-1">
                    <h2 className="font-bold">{title}</h2>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </AccordionTrigger>
            <AccordionContent className="prose dark:prose-invert prose-p:m-0">
                <Markdown>{content}</Markdown>
            </AccordionContent>
        </AccordionItem>
    )
}

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
        <div className="w-full flex justify-start items-start flex-col dark:prose-invert prose-p:text-sm prose-h3:mt-0 prose-h2:m-0 prose-hr:m-0 !select-none">
            <div className="prose dark:prose-invert">
                <h2>More about {props.character.name}</h2>
            </div>
            <Accordion collapsible type="single" defaultValue="📖 Bio" className="w-full prose-h2:m-0">

                {props.character.bio &&
                <AccordionSection 
                    title="📖 Bio"
                    description="A brief biography of the character."
                    content={props.character.bio}
                />
                }

                {props.character.intro && 
                <AccordionSection
                    title="👋 Introduction"
                    description="An introduction to the character."
                    content={props.character.intro}
                />
                }

                {props.character.personality &&
                <AccordionSection
                    title="🎭 Personality"
                    description="A description of the character's personality."
                    content={props.character.personality}
                />
                }

                {props.character.scenario &&
                <AccordionSection
                    title="🎬 Scenario"
                    description="A scenario or context in which the character operates."
                    content={props.character.scenario}
                />
                }

                {props.character.first_message && 
                <AccordionSection
                    title="💬 First Message"
                    description="The first message or interaction with the character."
                    content={props.character.first_message}
                />
                }

                {props.character.book && 
                <AccordionSection
                    title="📚 Book"
                    description="A book or reference related to the character."
                    content={props.character.book}
                />
                }

                {props.character.system_prompt && 
                <AccordionSection
                    title="⚙️ System Prompt"
                    description="The system prompt that guides the character's behavior."
                    content={props.character.system_prompt}
                />
                }

                {props.character.image_prompt && 
                <AccordionSection
                    title="🎨 Image Prompt"
                    description="A prompt or description for generating an image of the character."
                    content={props.character.image_prompt}
                />
                }

            </Accordion>

        </div>
        }
        </>
    )
}