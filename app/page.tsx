"use server";

import { Suspense } from "react";
import News from "@/components/homepage/News";
import SpotlighFallback from "@/components/homepage/SpotlightFallback";
import GeneralSwiper from "@/components/homepage/GeneralSwiper";
import CharacterCard from "@/components/character/CharacterCard";
import Spotlight from "@/components/Spotlight";

export default async function Home() {
  return (
    <div className="flex justify-center max-[2133px]:block max-h-full w-full overflow-y-auto overflow-x-hidden pb-20">
      <div className="flex flex-col gap-4 px-4 py-6 h-fit max-w-[1920px] overflow-x-visible relative">

        {/* <Searchbar /> */}

        {/* <Spotlight /> */}

        {/* <News /> */}

        {/* <div className="flex flex-col gap-2 w-full relative">
          <div className="prose dark:prose-invert prose-p:m-0 prose-h2:m-0">
              <p className="text-xs dark:text-zinc-400">Most chats in the last 3 days</p>
              <h2 className="dark:prose-invert text-lg font-bold">Trending</h2>
          </div>
          <GeneralSwiper apiUrl="/api/chars/trending" component={CharacterCard} rows={1} />
        </div> */}
{/* 
        <div className="flex flex-col gap-2 w-full relative">
          <div className="prose dark:prose-invert prose-p:m-0 prose-h2:m-0">
            <p className="text-xs dark:text-zinc-400">Check out what the Community made</p>
            <h2 className="dark:prose-invert text-lg font-bold">New</h2>
          </div>
          <GeneralSwiper apiUrl="/api/chars/newest" component={CharacterCard} rows={2} />
        </div>

        <div className="flex flex-col gap-2 w-full relative">
          <div className="prose dark:prose-invert prose-p:m-0 prose-h2:m-0">
              <p className="text-xs dark:text-zinc-400">The hot stuff</p>
              <h2 className="dark:prose-invert text-lg font-bold">Popular</h2>
          </div>
          <GeneralSwiper apiUrl="/api/chars/popular" component={CharacterCard} rows={3} />
        </div> */}


        {/* <CurrentCategoryProvider>
          <CategoriesLoader />
        </CurrentCategoryProvider> */}


      </div>
    </div>
  );
}
