import { getAPIKeyCount, getStats } from "@/functions/db/stats"
import SmallStatCard from "../graphs/SmallStatCard"


export async function SmallStats() {

    const totalCharacters = await getStats("num_characters")
    const totalStories = await getStats("num_stories")
    const apiKeyCount = await getAPIKeyCount()

    return (
        <>

            <SmallStatCard 
                count={totalCharacters[0].count}
                accumulated_count={totalCharacters[0].accumulated_count}
                description="Total number of Characters"
            />
            <SmallStatCard 
                count={totalStories[0].count}
                accumulated_count={totalStories[0].accumulated_count}
                description="Total number of Stories"
            />
            <SmallStatCard 
                count={apiKeyCount[0].api_key}
                description="Most popular AI"
            />
        </>
    )
}