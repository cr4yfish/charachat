import { getStats } from "@/functions/db/stats"
import { StatsCard } from "../graphs/StatsCard"
import CreatorLeaderboard from "./CreatorLeaderboard";

export default async function Stats() {

    const messageStats = await getStats("messages_public")
    const profileStats = await getStats("profiles_public")
    const activeUsers = await getStats("active_users", 6);

    return (
        <>

        <div className="flex flex-col gap-2 pb-4">
          <div className="prose dark:prose-invert prose-p:m-0 prose-h2:m-0">
            <h2 className="dark:prose-invert text-lg font-bold">Statistics</h2>
          </div>
            <CreatorLeaderboard />
          <div className="overflow-x-auto">
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
          </div>

        </div>
        
        </>
    )
}