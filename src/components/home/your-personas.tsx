"use client";

import { API_ROUTES } from "@/lib/constants/apiRoutes";
import InfiniteSwiperLoader from "../swiper/infinite-swiper-loader";
import { LIMITS } from "@/lib/constants/limits";
import { memo, Suspense } from "react";
import InfiniteSwiperLoaderFallback from "../swiper/infinite-swiper-loader-fallback";
import equal from "fast-deep-equal";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { Persona } from "@/lib/db/types/persona";
import PersonaImageCard from "../personas/persona-image-card";

type Props = {
    initOwnPersonas?: Array<Persona>;
}

export const PureYourPersonas = ({ initOwnPersonas }: Props) => {

    return (
        <div className="flex flex-col gap-4 h-full">
            <Link href={"/p/own"} className="w-full flex items-center justify-start gap-2 hover:underline">
                <h2 className="text-lg font-bold">Your Personas</h2>
                <ChevronRightIcon size={14} />
            </Link>
            

            <Suspense fallback={<InfiniteSwiperLoaderFallback rows={1} />} >
                <InfiniteSwiperLoader 
                    apiUrl={API_ROUTES.GET_OWN_PERSONAS}
                    limit={LIMITS.MAX_PERSONAS_PER_PAGE}
                    rows={1}
                    component={PersonaImageCard}
                    componentProps={{
                        hasLink: true,
                    }}
                    scrollThreshold={{
                        pixels: 600,
                        percent: 0.5, // 50% of the viewport width
                        adaptive: true, // Adjust for device type
                    }}
                    initialData={initOwnPersonas || []}
                />
            </Suspense>

        </div>
    );
}

export const YourPersonas = memo(PureYourPersonas, (prevProps, nextProps) => {
    // Only re-render if initialOwnCharacters has changed
    return equal(prevProps.initOwnPersonas, nextProps.initOwnPersonas);
})