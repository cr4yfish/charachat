"use server";

import InfiniteSwiperLoaderFallback from "../InfiniteSwiperLoaderFallback";
import InfiniteSwiperLoader from "../InfiniteSwiperLoder";
import { FC, Suspense } from "react";

type Props = {
    apiUrl: string;
    rows: number; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: FC<any>
}

export default async function GeneralSwiper(props: Props) {

    return (
        <Suspense fallback={<InfiniteSwiperLoaderFallback rows={props.rows} />} >
            <InfiniteSwiperLoader 
                apiUrl={props.apiUrl}
                limit={21} 
                rows={props.rows}
                component={props.component}
                componentProps={{
                    hasLink: true,
                }}
            />
        </Suspense>
    )
}