
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import dynamic from "next/dynamic";
import { Character } from "@/types/db"
import LatestChat from "./latest-chat";
const NewCharacterFromScratch = dynamic(() => import("@/components/new-character/new-character-from-scratch")); 

type Props = {
    draftChar: Character | undefined | null;
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
            <p className="text-xs text-muted-foreground">Continue where you left off</p>

            <Carousel>
                <CarouselContent>

                    {props.draftChar && (
                        <CarouselItem>
                            <NewCharacterFromScratch small initCharacter={props.draftChar} />
                        </CarouselItem>
                    )}

                    <LatestChat />
     
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>

        </div>
    )
}