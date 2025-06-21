import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button";
import React from "react";

type NewCardProps = {
  title: string;
  description: React.ReactNode;
}

const NewsCard = (props: NewCardProps) => {
  return (
    <>
      <Alert className="rounded-3xl dark:bg-neutral-900/50 dark:prose-invert prose-p:m-0 w-[300px] h-[90px] flex flex-col gap-1 justify-start">
        <AlertTitle className="m-0" >{props.title}</AlertTitle>
        <AlertDescription className="text-xs">
          {props.description}
        </AlertDescription>
      </Alert>
    </>
  )
}

export default function News() {

    return (
        <>
        <div className="w-full overflow-y-auto pb-3">
          <div className="flex flex-row items-center gap-4 w-fit">

            <NewsCard 
              title="🚀 Join our community!"
              description={
                <>
                  <div className="flex flex-row items-center gap-2">
                    <Link target="_blank" href={"https://www.reddit.com/r/Charachat"}>
                      <Button variant={"link"} className="text-red-400" >Reddit</Button>
                    </Link>
                    <Link target="_blank" href={"https://discord.gg/2HqqwcwGCy"}>
                      <Button variant={"link"} className="text-blue-500">Discord</Button>
                    </Link>
                  </div>
                </>
              }
            />

            <NewsCard 
              title="🔥 v2!"
              description={
                <>
                  <p>Welcome to Charachat v2!</p>
                </>
              }
            />

            <NewsCard 
              title="😭 Come on people"
              description={
                <>
                  <p>Remember to mark stuff as NSFW please</p>
                </>
              }
            />

          </div>
        </div>
        </>
    )
}