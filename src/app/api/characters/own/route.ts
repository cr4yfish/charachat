import { getUserCharacters } from "@/lib/db/character";
import { LIMITS } from "@/lib/limits";


export async function GET(request: Request) {
    const url = new URL(request.url);
    const cursor = parseInt(url.searchParams.get("cursor") || "0", 10);
    const limit = parseInt(url.searchParams.get("limit") || LIMITS.MAX_CHARACTERS_PER_PAGE.toString(), 10);
;
    const res = await getUserCharacters({
        cursor: cursor,
        limit: limit
    })

    return Response.json(res);
}