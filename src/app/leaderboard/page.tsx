import { LIMITS } from "@/lib/constants/limits";
import { TIMINGS } from "@/lib/constants/timings";
import { getLeaderboard } from "@/lib/db/stats";
import { safeParseLink } from "@/lib/utils/text";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { redirect } from "next/navigation";



export default async function Leaderboard({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
    }) {
    const { page="0" } = await searchParams;

    const currentPage = parseInt(page, 10);

    if(currentPage < 0 || isNaN(currentPage)) {
        redirect("/leaderboard");
    }

    const cursor =  (currentPage) * LIMITS.MAX_LEADERBOARD_PAGINATION;
    const offset = (currentPage) * LIMITS.MAX_LEADERBOARD_PAGINATION;

    const initialData = await unstable_cache(
        async () => await getLeaderboard({
            cursor,
            limit: LIMITS.MAX_LEADERBOARD_PAGINATION
        }),
        [`leaderboard-cursor-${cursor}`],
        {
            revalidate: TIMINGS.ONE_DAY, // 1 hour
        }
    )();

    const hasNextPage = initialData.length === LIMITS.MAX_LEADERBOARD_PAGINATION;
    const hasPreviousPage = currentPage > 0;

    return (
        <div className="size-full relative overflow-hidden">
            <div className=" overflow-y-auto max-h-screen ios-safe-header-padding-chats pb-[100px]">
                <div className="relative size-full flex flex-col gap-2 px-4 h-full overflow-y-hidden">
                    {initialData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border-b">
                            <Link href={"/u/" + item.user} className="flex items-center gap-2">
                                <span className=" text-amber-300">#{index+1+offset}</span>
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
                <Pagination>
                    <PaginationContent>

                        <PaginationItem>
                            <PaginationPrevious href={"/leaderboard?page=" + (currentPage-1)} />
                        </PaginationItem>

                        {hasPreviousPage &&
                        <PaginationItem>
                            <PaginationLink href={"/leaderboard?page=" + (currentPage-1)}>{currentPage}</PaginationLink>
                        </PaginationItem>
                        }
                        <PaginationItem>
                            <PaginationLink href="#">{currentPage+1}</PaginationLink>
                        </PaginationItem>

                        {hasNextPage &&
                        <PaginationItem>
                            <PaginationLink href={"/leaderboard?page=" + (currentPage+1)}>{currentPage+2}</PaginationLink>
                        </PaginationItem>
                        }

                        <PaginationItem>
                            <PaginationNext href={"/leaderboard?page=" + (currentPage+1)} />
                        </PaginationItem>
                        
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}