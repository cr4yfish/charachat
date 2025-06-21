import { getCachedSpotlight } from "@/lib/db/character";


export async function GET() {
        const spotlightData = await getCachedSpotlight();
        return Response.json(spotlightData);
}