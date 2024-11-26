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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Button } from "@/components/utils/Button";
import { LoadMoreProps } from "@/types/client";

export default async function Home() {

  const defaultLoad: LoadMoreProps = {
    cursor: 0,
    limit: 5,
  }

  let characters: Character[] = [];
  let popularCharacters: Character[] = [];
  const stories = await getStories(defaultLoad);
  const categories = await getCategories(defaultLoad);

  try {
    characters = await getCharacters(defaultLoad);
    popularCharacters = await getPopularCharacters(defaultLoad);
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
      <div className="flex flex-col gap-4 px-4 py-6 h-fit max-w-[1920px] overflow-x-visible relative">

        <Searchbar />

        <Spotlight character={characters[0]} />

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
          <div className="prose dark:prose-invert prose-p:m-0 prose-h2:m-0">
            <p className="text-xs dark:text-zinc-400">Immerse yourself in these engaging stories</p>
            <h2 className="dark:prose-invert text-lg font-bold">Stories</h2>
          </div>
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
          <div className="prose dark:prose-invert prose-p:m-0 prose-h2:m-0">
            <p className="text-xs dark:text-zinc-400">Check out what the Community made</p>
            <h2 className="dark:prose-invert text-lg font-bold">New</h2>
          </div>
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

      </div>
    </div>
  );
}
