"use server";

import { getLeaderboard } from "@/functions/db/stats";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Username from "../user/Username";
import { Profile } from "@/types/db";


export default async function CreatorLeaderboard() {
    
    const leaderboard = await getLeaderboard()

    return (
        <>
        <Card className="w-[300px] max-sm:max-w-full bg-white/40 dark:bg-zinc-900/20">
            <CardHeader>
                <CardTitle>Top 10 Creators</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
                <div className="w-[200px] flex justify-between text-xs text-zinc-700 dark:text-zinc-400">
                    <p className="">Users</p>  
                    <p className="">Chats</p>  
                </div>
                
                {leaderboard.map((position, index) => (
                    <div key={position.user} className="flex items-center justify-between gap-1 w-[200px]">
                        <p className="font-bold text-lg">{index+1}</p>
                        <Username 
                            hasLink 
                            hasImage
                            fullWidth
                            onlyName 
                            textSize="md" 
                            profile={{...position } as unknown as Profile} 
                        />
                        <p>{position.total_chat_count}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
        </>
    )
}