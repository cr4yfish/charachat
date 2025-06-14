import { getCharacters, getNewestCharacter, getTrendingCharacters } from "@/functions/db/character";


export async function GET(request: Request) {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || '0';
    const limit = url.searchParams.get('limit') || '21';
    const args = url.searchParams.get('args') ? JSON.parse(url.searchParams.get('args') as string) : undefined;
    
    const res = await getCharacters({
        cursor: parseInt(cursor, 10),
        limit: parseInt(limit, 10),
        args: args,
    })

    return Response.json(res);
}