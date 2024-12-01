"use server";

import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Button } from "@/components/utils/Button";

export default async function News() {

    return (
        <>
        <ScrollShadow orientation={"horizontal"} className="w-full overflow-y-auto pb-3">
          <div className="flex flex-row items-center gap-4 w-fit">

            <Alert variant={"blur"} className="prose dark:prose-invert prose-p:m-0 w-[300px]  h-[150px]">
              <AlertTitle className="m-0 mb-2" >🎉 Welcome to Charachat! 🎉</AlertTitle>
              <AlertDescription>
                <p>Charachat: Create, share & chat with AI characters from you & the community. Use the hottest in AI like Video generation and Agents.</p>
              </AlertDescription>
            </Alert>

            <Alert variant={"blur"} className="prose dark:prose-invert prose-p:m-0 w-[300px] h-[150px]">
              <AlertTitle className="m-0 mb-2" >Join our community!</AlertTitle>
              <AlertDescription>
                <p>🚀 Help shape Charachat - share ideas & report bugs on Reddit & Discord</p>
                <div className="flex flex-row items-center gap-2">
                  <Link target="_blank" href={"https://www.reddit.com/r/Charachat"}>
                    <Button variant="light" color="danger">Reddit</Button>
                  </Link>
                  <Link target="_blank" href={"https://discord.gg/2HqqwcwGCy"}>
                    <Button variant="light" color="primary">Discord</Button>
                  </Link>
                </div>
              </AlertDescription>
            </Alert>

            <Alert variant={"blur"} className="prose dark:prose-invert prose-p:m-0 w-[300px] h-[150px]">
              <AlertTitle className="m-0 mb-2" >New stuff</AlertTitle>
              <AlertDescription>
                <p>🎨 New features are added every day</p>
                <p>Dont miss anything by checking the Dev Updates on <Link href={"https://www.reddit.com/r/Charachat"} target="_blank" className="dark:text-blue-500">Reddit</Link></p>
              </AlertDescription>
            </Alert>

          </div>
        </ScrollShadow>
        </>
    )
}