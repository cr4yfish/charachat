"use server";

import { getCharacters, getPopularCharacters } from "@/functions/db/character";
import Searchbar from "@/components/Searchbar";
import { CurrentCategoryProvider } from "@/context/CurrentCategoryProvider";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Button } from "@/components/utils/Button";
import PopularCharactersSwiper from "@/components/homepage/PopularCharacters";
import { Suspense } from "react";
import InfiniteSwiperLoaderFallback from "@/components/InfiniteSwiperLoaderFallback";
import StoriesSwiper from "@/components/homepage/StoriesSwiper";
import CategoriesLoader from "@/components/homepage/CategoriesLoader";

export default async function Home() {

  return (
    <div className="flex justify-center max-2xl:block max-h-full w-full overflow-y-auto overflow-x-hidden pb-20">
      <div className="flex flex-col gap-4 px-4 py-6 h-fit max-w-[1920px] overflow-x-visible relative">

        <Searchbar />

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
          
          <div className="flex flex-col gap-2 w-full relative">
            <div className="prose dark:prose-invert prose-p:m-0 prose-h2:m-0">
                <p className="text-xs dark:text-zinc-400">The hot stuff</p>
                <h2 className="dark:prose-invert text-lg font-bold">Popular</h2>
            </div>
            <Suspense fallback={<InfiniteSwiperLoaderFallback rows={3} />}>
              <PopularCharactersSwiper loader={getPopularCharacters} />
            </Suspense>
        </div>
        

        <div className="flex flex-col gap-2">
          <div className="prose dark:prose-invert prose-p:m-0 prose-h2:m-0">
            <p className="text-xs dark:text-zinc-400">Immerse yourself in these engaging stories</p>
            <h2 className="dark:prose-invert text-lg font-bold">Stories</h2>
          </div>
          <Suspense fallback={<InfiniteSwiperLoaderFallback rows={2} />}>
            <StoriesSwiper />
          </Suspense>
        </div>

        <div className="flex flex-col gap-2 w-full relative">
          <div className="prose dark:prose-invert prose-p:m-0 prose-h2:m-0">
            <p className="text-xs dark:text-zinc-400">Check out what the Community made</p>
            <h2 className="dark:prose-invert text-lg font-bold">New</h2>
          </div>
          <Suspense fallback={<InfiniteSwiperLoaderFallback rows={3} />}>
            <PopularCharactersSwiper loader={getCharacters} />
          </Suspense>
        </div>

        <CurrentCategoryProvider>
          <CategoriesLoader />
        </CurrentCategoryProvider>

      </div>
    </div>
  );
}
