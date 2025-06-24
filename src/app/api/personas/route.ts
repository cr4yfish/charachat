import { getPersonas } from "@/lib/db/persona";
import { LIMITS } from "@/lib/constants/limits";


export async function GET() {
    
    const res = await getPersonas({
        limit: LIMITS.MAX_PERSONAS_PER_PAGE,
        cursor: 0,
    })

    return Response.json(res);
}