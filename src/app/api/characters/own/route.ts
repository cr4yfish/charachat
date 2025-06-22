import { getUserCharacters } from "@/lib/db/character";
import { LIMITS } from "@/lib/limits";


export async function GET() {

    const res = await getUserCharacters({
        cursor: 0,
        limit: LIMITS.MAX_CHARACTERS_PER_PAGE
    })

    return Response.json(res);
}