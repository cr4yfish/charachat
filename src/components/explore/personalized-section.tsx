
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import dynamic from "next/dynamic";
import { Character } from "@/types/db"

const LatestChat = dynamic(() => import("@/components/explore/latest-chat"));
const NewCharacterFromScratch = dynamic(() => import("@/components/new-character/new-character-from-scratch")); 
const WelcomeCard = dynamic(() => import("@/components/explore/welcome-card"));

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

            <Carousel>
                <CarouselContent>

                    <WelcomeCard />

                    {props.draftChar && (
                        <CarouselItem className=" min-lg:basis-1/3">
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