import { TIMINGS } from "@/lib/constants/timings";
import { getLeaderboard } from "@/lib/db/stats";
import { safeParseLink } from "@/lib/utils/text";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";




export default async function Leaderboard() {
    const initialData = await unstable_cache(
        async () => await getLeaderboard({
            cursor: 0,
            limit: 3
        }),
        ["leaderboard-initial"],
        {
            revalidate: TIMINGS.ONE_DAY, // 1 hour
        }
    )();

    return (
        <div className="flex flex-col gap-2">
            {initialData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border-b">
                    <Link href={"/u/" + item.user} className="flex items-center gap-2">
                        <span className=" text-amber-300">#{index+1}</span>
                        <div className="overflow-hidden relative size-6 rounded-full shrink-0">
                            <Image 
                                alt="" fill
                                src={safeParseLink(item.avatar_link)}
                                className="object-cover object-center"
                            />
                        </div>
                        <span className="font-semibold text-sm text-white/80">{item.username}</span>
                    </Link>
                    <span className="text-muted-foreground">{item.total_chat_count.toLocaleString()} chats</span>
                </div>
            ))}
        </div>
    )
}