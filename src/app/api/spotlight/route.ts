"use server";

import { getNewestCharacter } from "@/lib/db/character";
import { safeParseLink } from "@/lib/utils";
import { Vibrant } from "node-vibrant/node";
import { unstable_cache } from "next/cache";
import { TIMINGS } from "@/lib/timings";

export const getCachedSpotlight = unstable_cache(
    async () => {
        const character = await getNewestCharacter();
        const imageUrl = safeParseLink(character.image_link);

        const isSupportedUrl = !imageUrl.includes(".webp");

        const palette = isSupportedUrl && await Vibrant.from(imageUrl).getPalette().catch((err) => {
                console.warn("Error getting palette, skipping it:", err, "Character:", character.name);
                return null;
        });

        // convert palette to a simpler object with hex values
        const paletteHex =  {
                Vibrant: palette ? palette.Vibrant?.hex : "#8ec5ff",
                DarkVibrant: palette ?palette.DarkVibrant?.hex  : "#8ec5ff",
                LightVibrant: palette ?palette.LightVibrant?.hex  : "#8ec5ff",
                Muted: palette ? palette.Muted?.hex  : "#8ec5ff",
                DarkMuted: palette ? palette.DarkMuted?.hex  : "#8ec5ff",
                LightMuted: palette ? palette.LightMuted?.hex  : "#8ec5ff",
        };

        return {
                character: {
                        ...character,
                        image_link: imageUrl,
                },
                palette: paletteHex,
        };
    },
    ['spotlight'],
    { revalidate: TIMINGS.ONE_DAY }
);

export async function GET() {
        const spotlightData = await getCachedSpotlight();
        return Response.json(spotlightData);
}