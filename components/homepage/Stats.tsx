import { getStats } from "@/functions/db/stats"
import { StatsCard } from "../graphs/StatsCard"


export async function Stats() {

    const messageStats = await getStats("messages_public")
    const profileStats = await getStats("profiles_public")

    return (
        <>
        <div className="flex items-center gap-2 flex-wrap">

            <StatsCard 
                stats={messageStats}
                title="Messages"
                description="Total number of messages"
            />

            <StatsCard 
                stats={profileStats}
                title="New Users"
                description="New users per month"
            />
        </div>
        </>
    )
}