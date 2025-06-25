import { getOwnPersonas } from "@/lib/db/persona";
import { LIMITS } from "@/lib/constants/limits";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || '0';
    const limit = url.searchParams.get('limit') || LIMITS.MAX_PERSONAS_PER_PAGE.toString();
    const args = url.searchParams.get('args') ? JSON.parse(url.searchParams.get('args') as string) : undefined;
    
    const res = await getOwnPersonas({
        cursor: parseInt(cursor, 10),
        limit: parseInt(limit, 10),
        args
    })

    return Response.json(res);
}