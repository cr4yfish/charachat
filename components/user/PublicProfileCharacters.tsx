"use server";

import { getPublicUserCharacters } from "@/functions/db/character";
import InfiniteSwiperLoader from "../InfiniteSwiperLoder";
import CharacterCard from "../character/CharacterCard";

type Props = {
    userId: string
}

export default async function PublicProfileCharacters(props: Props) {

    const initCharacters = await getPublicUserCharacters({ limit: 20, cursor: 0, args: { userId: props.userId } });

    return (
        <>
        <InfiniteSwiperLoader
            initialData={initCharacters}
            limit={20}
            loadMore={getPublicUserCharacters}
            args={{ userId: props.userId }}
            rows={2}
            component={CharacterCard}
            componentProps={{ hasLink: true }}
        />
        </>
    )
}