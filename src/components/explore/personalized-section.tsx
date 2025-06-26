
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import dynamic from "next/dynamic";
import MarketingCard from "./marketing-card";
import { getDraftCharacterFromCookie } from "@/app/c/new/actions";

const LatestChat = dynamic(() => import("@/components/explore/latest-chat"));
const NewCharacterFromScratch = dynamic(() => import("@/components/new-character/new-character-from-scratch")); 
const WelcomeCard = dynamic(() => import("@/components/explore/welcome-card"));


/**
 * Show personalized content
 * 
 * Content:
 * - Draft character if available
 * - Recent chats if any
 * - Other personalized content (e.g. recommendations)
 * 
*/
export async function PersonalizedSection() {
    const draftChar = await getDraftCharacterFromCookie();

    return (
        <div className="flex flex-col gap-2 w-full relative">

            <Carousel>
                <CarouselContent>

                    <MarketingCard />

                    {draftChar && (
                        <CarouselItem className=" min-lg:basis-1/3">
                            <NewCharacterFromScratch small initCharacter={draftChar} />
                        </CarouselItem>
                    )}

                    <LatestChat />
                    
                    <WelcomeCard />

                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>

        </div>
    )
}