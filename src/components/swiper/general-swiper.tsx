"use server";

import { LIMITS } from "@/lib/limits";
import InfiniteSwiperLoader from "./infinite-swiper-loader";
import InfiniteSwiperLoaderFallback from "./infinite-swiper-loader-fallback";
import { FC, Suspense } from "react";

type Props = {
    apiUrl: string;
    rows: number; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: FC<any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData: any[]; // Optional initial data to pass to the component
}

export default async function GeneralSwiper(props: Props) {

    return (
        <Suspense fallback={<InfiniteSwiperLoaderFallback rows={props.rows} />} >
            <InfiniteSwiperLoader 
                apiUrl={props.apiUrl}
                limit={LIMITS.MAX_CHARACTERS_PER_PAGE} 
                rows={props.rows}
                component={props.component}
                componentProps={{
                    hasLink: true,
                }}
                scrollThreshold={{
                    pixels: 600,
                    percent: 0.5, // 50% of the viewport width
                    adaptive: true, // Adjust for device type
                }}
                initialData={props.initialData}
            />
        </Suspense>
    )
}