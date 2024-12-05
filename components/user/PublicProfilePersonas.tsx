"use server";

import InfiniteSwiperLoader from "../InfiniteSwiperLoder";
import PersonaCard from "../persona/PersonaCard";
import { getPublicUserPersonas } from "@/functions/db/personas";

type Props = {
    userId: string
}

export default async function PublicProfileCharacters(props: Props) {

    const initPersonas = await getPublicUserPersonas({ limit: 20, cursor: 0, args: { userId: props.userId } });

    return (
        <>
        <InfiniteSwiperLoader
            initialData={initPersonas}
            limit={20}
            loadMore={getPublicUserPersonas}
            args={{ userId: props.userId }}
            rows={2}
            component={PersonaCard}
            componentProps={{ hasLink: true }}
        />
        </>
    )
}