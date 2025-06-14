"use server";

import { getNewestCharacter } from "@/functions/db/character";
import { safeParseLink } from "@/lib/utils";
import { Vibrant } from "node-vibrant/node";

export async function GET(request: Request) {
    const character = await getNewestCharacter();
    const imageUrl = safeParseLink(character.image_link);

    const isSupportedUrl = !imageUrl.includes(".webp");

    const palette = isSupportedUrl && await Vibrant.from(imageUrl).getPalette().catch((err) => {
        console.error("Error getting palette, skipping it:", err, "Character:", character.name);
        return null;
    });
    

    return Response.json({
        character: {
            ...character,
            image_link: imageUrl,
        },
        palette: palette ? {
            DarkVibrant: palette.DarkVibrant?.hex,
            LightVibrant: palette.LightVibrant?.hex,
            Vibrant: palette.Vibrant?.hex,
        } : null,
    })
}