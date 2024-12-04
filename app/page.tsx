"use server";

import { getCharacters, getPopularCharacters } from "@/functions/db/character";
import Searchbar from "@/components/Searchbar";
import { CurrentCategoryProvider } from "@/context/CurrentCategoryProvider";
import { Suspense } from "react";
import InfiniteSwiperLoaderFallback from "@/components/InfiniteSwiperLoaderFallback";
import StoriesSwiper from "@/components/homepage/StoriesSwiper";
import CategoriesLoader from "@/components/homepage/CategoriesLoader";
import SpotlightLoader from "@/components/homepage/SpotlightLoader";
import News from "@/components/homepage/News";
import CharactersSwiper from "@/components/homepage/CharactersSwiper";
import SpotlighFallback from "@/components/homepage/SpotlightFallback";

export default async function Home() {
  return (
    <div className="flex justify-center max-[2133px]:block max-h-full w-full overflow-y-auto overflow-x-hidden pb-20">
      <div className="flex flex-col gap-4 px-4 py-6 h-fit max-w-[1920px] overflow-x-visible relative">

        <Searchbar />

        <Suspense fallback={<SpotlighFallback />}>
          <SpotlightLoader />
        </Suspense>

        <News />
        
        <div className="flex flex-col gap-2 w-full relative">
          <div className="prose dark:prose-invert prose-p:m-0 prose-h2:m-0">
              <p className="text-xs dark:text-zinc-400">The hot stuff</p>
              <h2 className="dark:prose-invert text-lg font-bold">Popular</h2>
          </div>
          <Suspense fallback={<InfiniteSwiperLoaderFallback rows={3} />}>
            <CharactersSwiper loader={getPopularCharacters} />
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
            <CharactersSwiper loader={getCharacters} />
          </Suspense>
        </div>

        <CurrentCategoryProvider>
          <CategoriesLoader />
        </CurrentCategoryProvider>

      </div>
    </div>
  );
}
