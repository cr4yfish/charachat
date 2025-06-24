"use client";

import { API_ROUTES } from "@/lib/constants/apiRoutes";
import ImageCharacterCard from "../character/character-card-image";
import InfiniteSwiperLoader from "../swiper/infinite-swiper-loader";
import { LIMITS } from "@/lib/constants/limits";
import { memo, Suspense } from "react";
import InfiniteSwiperLoaderFallback from "../swiper/infinite-swiper-loader-fallback";
import { Character } from "@/types/db";
import equal from "fast-deep-equal";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

type Props = {
    initialOwnCharacters?: Array<Character>;
}

export const PureYourCharacters = ({ initialOwnCharacters }: Props) => {

    return (
        <div className="flex flex-col gap-4 h-full">
            <Link href={"/c/own"} className="w-full flex items-center justify-start gap-2 hover:underline">
                <h2 className="text-lg font-bold">Your Characters</h2>
                <ChevronRightIcon size={14} />
            </Link>
            

            <Suspense fallback={<InfiniteSwiperLoaderFallback rows={1} />} >
                <InfiniteSwiperLoader 
                    apiUrl={API_ROUTES.GET_OWN_CHARACTERS}
                    limit={LIMITS.MAX_CHARACTERS_PER_PAGE}
                    rows={1}
                    component={ImageCharacterCard}
                    componentProps={{
                        hasLink: true,
                    }}
                    scrollThreshold={{
                        pixels: 600,
                        percent: 0.5, // 50% of the viewport width
                        adaptive: true, // Adjust for device type
                    }}
                    initialData={initialOwnCharacters || []}
                />
            </Suspense>

        </div>
    );
}

export const YourCharacters = memo(PureYourCharacters, (prevProps, nextProps) => {
    // Only re-render if initialOwnCharacters has changed
    return equal(prevProps.initialOwnCharacters, nextProps.initialOwnCharacters);
})