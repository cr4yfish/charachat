import { searchPersonasByAITags } from "@/lib/db/persona";


export async function GET(request: Request) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    const includePrivate = url.searchParams.get("include_private") === "true";

    // Fetch personas based on the query
    const personas = await searchPersonasByAITags([query], {
        sort: "relevance",
        includePrivate,
    });

    return Response.json(personas);
    
}