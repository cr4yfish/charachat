import { getTrendingCharacters } from "@/lib/db/character";



export async function GET() {


    const res = await getTrendingCharacters({ cursor: 0, limit: 10 });

    return Response.json(res);
}