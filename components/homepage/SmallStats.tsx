import { getStats } from "@/functions/db/stats"
import SmallStatCard from "../graphs/SmallStatCard"


export async function SmallStats() {

    const totalCharacters = await getStats("num_characters")
    const totalStories = await getStats("num_stories")

    return (
        <>

            <SmallStatCard 
                data={totalCharacters}
                description="Total number of Characters"
            />
            <SmallStatCard 
                data={totalStories}
                description="Total number of Stories"
            />
        </>
    )
}