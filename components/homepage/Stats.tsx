import { getStats } from "@/functions/db/stats"
import { StatsCard } from "../graphs/StatsCard"


export async function Stats() {

    const messageStats = await getStats("messages_public")
    const profileStats = await getStats("profiles_public")
    const activeUsers = await getStats("active_users", 6);

    return (
        <>
        <div className="flex items-center gap-3 w-fit h-fit">

            <StatsCard 
                stats={messageStats}
                title="Messages"
                description="Total number of messages"
            />

            <StatsCard 
                stats={profileStats}
                title="Users"
                description="Total number of users"
            />

            <StatsCard 
                stats={activeUsers}
                title="Active Users"
                description="Users active in the last 7 days"
                interval="daily"
            />
        </div>
        </>
    )
}