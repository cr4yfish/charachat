import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/utils/Button";
import React from "react";

type NewCardProps = {
  title: string;
  description: React.ReactNode;
}

const NewsCard = (props: NewCardProps) => {
  return (
    <>
      <Alert variant={"blur"} className="prose dark:prose-invert prose-p:m-0 w-[300px] h-[150px]">
        <AlertTitle className="m-0 mb-2" >{props.title}</AlertTitle>
        <AlertDescription>
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
              title="🎉 Welcome to Charachat! 🎉"
              description={
                <p>Charachat: Create, share & chat with AI characters from you & the community.</p>
              }
            />

            <NewsCard 
              title="🚀 Join our community!"
              description={
                <>
                  <p>Help shape Charachat - share ideas & report bugs on Reddit & Discord</p>
                  <div className="flex flex-row items-center gap-2">
                    <Link target="_blank" href={"https://www.reddit.com/r/Charachat"}>
                      <Button variant="flat" color="danger">Reddit</Button>
                    </Link>
                    <Link target="_blank" href={"https://discord.gg/2HqqwcwGCy"}>
                      <Button variant="flat" color="primary">Discord</Button>
                    </Link>
                  </div>
                </>
              }
            />

            <NewsCard 
              title="🎨 New stuff"
              description={
                <>
                  <p>Dont miss anything by checking the Dev Updates on <Link href={"https://www.reddit.com/r/Charachat"} target="_blank" className="dark:text-blue-500">Reddit</Link></p>
                </>
              }
            />

          </div>
        </div>
        </>
    )
}