
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import dynamic from "next/dynamic";
import { Character } from "@/types/db"
const NewCharacterFromScratch = dynamic(() => import("@/components/new-character/new-character-from-scratch")); 

type Props = {
    draftChar: Character | undefined;
}

/**
 * Show personalized content
 * 
 * Content:
 * - Draft character if available
 * - Recent chats if any
 * - Other personalized content (e.g. recommendations)
 * 
 * @param props 
 * @returns 
 */
export function PersonalizedSection(props: Props) {


    return (
        <div className="flex flex-col gap-2 w-full relative">
            <p className="text-xs dark:text-zinc-400">Continue where you left off</p>

            <Carousel>
                <CarouselContent>
                    <CarouselItem>
                        {props.draftChar && (
                            <NewCharacterFromScratch small initCharacter={props.draftChar} />
                        )}
                    </CarouselItem>
                    <CarouselItem>
                        
                    </CarouselItem>
                    <CarouselItem>
                        
                    </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>

        </div>
    )
}