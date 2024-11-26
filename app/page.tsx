"use server";

import CharacterCard from "@/components/character/CharacterCard";
import { getCharacters, getPopularCharacters } from "@/functions/db/character";
import { Character } from "@/types/db";

import { getStories } from "@/functions/db/stories";
import StoryCard from "@/components/story/StoryCard";
import Searchbar from "@/components/Searchbar";
import CategoryScroller from "@/components/CategoryScroller";
import { getCategories } from "@/functions/db/categories";
import InfiniteSwiperLoader from "@/components/InfiniteSwiperLoder";
import { CurrentCategoryProvider } from "@/context/CurrentCategoryProvider";
import Spotlight from "@/components/Spotlight";
import Link from "next/link";
import { getPersonas } from "@/functions/db/personas";
import PersonaCard from "@/components/persona/PersonaCard";

export default async function Home() {

  let characters: Character[] = [];
  let popularCharacters: Character[] = [];
  const stories = await getStories(0, 5);
  const categories = await getCategories(0, 5);
  const personas = await getPersonas(0, 5);

  try {
    characters = await getCharacters(0, 5);
    popularCharacters = await getPopularCharacters(0, 5);
  } catch (error) {
    const err = error as Error;
    return (
      <>
      <div className="prose dark:prose-invert p-10">
        <h1>Uh, oh. Something went wrong</h1>
        <p>And I don&apos;t know what. Try refreshing the page or Logout and back in. Also please report this issue.</p>
        <div className="flex flex-col gap-1a">
          <Link href={"https://github.com/cr4yfish/charachat/issues/new"} className="dark:text-blue-500">Report this on GitHub</Link>
          <span>or</span>
          <Link href={"https://www.reddit.com/r/Charachat/"} className="dark:text-blue-500">Report this on Reddit</Link>
        </div>
        
        <h3>This is the error message:</h3>
        <pre>{err.message}</pre>
      </div>
      </>
    )
  }

  return (
    <div className="flex justify-center max-2xl:block max-h-full w-full overflow-y-auto overflow-x-hidden pb-20">
      <div className="flex flex-col gap-4 px-4 py-6 h-fit max-w-[1300px] overflow-x-hidden relative">

        <Searchbar />

        <Spotlight character={characters[0]} />

        <div className="flex flex-col gap-2 w-full relative">
          <h2 className="dark:prose-invert text-lg font-bold">Popular</h2>
          <InfiniteSwiperLoader 
            loadMore={getPopularCharacters} 
            limit={5} 
            initialData={popularCharacters} 
            component={CharacterCard}
            componentProps={{
              hasLink: true,
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="dark:prose-invert text-lg font-bold">Stories</h2>
          <InfiniteSwiperLoader 
            loadMore={getStories}
            limit={5}
            initialData={stories}
            component={StoryCard}
            componentProps={{
              hasLink: true,
            }}
          />
        </div>

        <div className="flex flex-col gap-2 w-full relative">
          <h2 className="dark:prose-invert text-lg font-bold">New</h2>
          <InfiniteSwiperLoader 
            loadMore={getCharacters} 
            limit={5} 
            initialData={characters} 
            component={CharacterCard}
            componentProps={{
              hasLink: true,
            }}
          />
        </div>

        <CurrentCategoryProvider>
          <CategoryScroller categories={categories} />
        </CurrentCategoryProvider>

        <div className="flex flex-col gap-2 w-full relative">
          <h2 className="dark:prose-invert text-lg font-bold">Personas</h2>
          <InfiniteSwiperLoader 
            loadMore={getPersonas} 
            limit={5} 
            initialData={personas} 
            component={PersonaCard}
            componentProps={{
              hasLink: true,
            }}
          />
        </div>

      </div>
    </div>
  );
}
