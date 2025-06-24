import { getRandomCharacters } from "@/lib/db/character";
import { TIMINGS } from "@/lib/constants/timings";
import { unstable_cache } from 'next/cache';

export async function GET() {

    const res = await unstable_cache(
        async () => await getRandomCharacters(),
        [`random-characters`],
        {
            revalidate: TIMINGS.ONE_MINUTE,
            tags: ['characters'],
        }
    )();

    return Response.json(res);
}