import ImageCharacterCard from "@/components/character/character-card-image";
import News from "@/components/explore/news";
import Spotlight, { SpotlightData } from "@/components/explore/spotlight";
import GeneralSwiper from "@/components/swiper/general-swiper";
import { getDraftCharacterFromCookie } from "./c/new/actions";
import { API_ROUTES } from "@/lib/apiRoutes";
import { PersonalizedSection } from "@/components/explore/personalized-section";
import { CurrentCategoryProvider } from "@/hooks/use-current-category";
import CategoryScroller from "@/components/categories/category-scroller";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TotalCharacterStats from "@/components/stats/total-character-stats";
import { getCachedNewestCharacters, getCachedPopularCharacters, getCachedSpotlight, getCachedTrendingInitialCharacters, getInitialCachedCharactersByCategory } from "@/lib/db/character";
import { getCachedInitialCategories } from "@/lib/db/categories";
import RandomCharacters from "@/components/search/random-characters";
import Image from "next/image";
import { ChevronRightIcon } from "lucide-react";

export default async function Home() {
  const draftChar = await getDraftCharacterFromCookie();

  // Initial data thats aggressively cached
  const spotlight: SpotlightData = await getCachedSpotlight();
  const initialTrending = await getCachedTrendingInitialCharacters();
  const initialNewest = await getCachedNewestCharacters();
  const initialPopular = await getCachedPopularCharacters();
  const initCategories = await getCachedInitialCategories();
  const initialCurrentCategory = initCategories[0];
  const intialCharactersForIntialCategory = await getInitialCachedCharactersByCategory(initialCurrentCategory.id);

  return (
    <div className="h-full w-full">

      <Spotlight init={spotlight} />

      <div className="flex flex-col gap-4 px-4 py-6 pt-1  pb-[120px]">

        {/* Personalized section */}
        <PersonalizedSection draftChar={draftChar} />
        

        <div className="flex flex-col gap-2 w-full relative">
          <div>
              <p className="text-xs text-muted-foreground">Most chats in the last 3 days</p>
              <h2 className="dark:prose-invert text-lg font-bold">Trending 🔥</h2>
          </div>
          <GeneralSwiper initialData={initialTrending} apiUrl={API_ROUTES.GET_TRENDING_CHARACTERS} component={ImageCharacterCard} rows={1} />
        </div>

        <News />

        {/* Page break on iphone 15 */}

        <div className="flex flex-col gap-2 w-full relative">
          <div>
            <p className="text-xs text-muted-foreground">Check out what the Community made</p>
            <h2 className="dark:prose-invert text-lg font-bold">New</h2>
          </div>
          <GeneralSwiper initialData={initialNewest} apiUrl={API_ROUTES.GET_NEWEST_CHARACTERS} component={ImageCharacterCard} rows={2} />
        </div>

        <div className="flex flex-row items-center gap-4 overflow-x-auto w-full relative">
          <RandomCharacters />
          <TotalCharacterStats />
        </div>

        <CurrentCategoryProvider>
          <CategoryScroller initialCategories={initCategories} currentCategory={initialCurrentCategory} initialCharacters={intialCharactersForIntialCategory} />
        </CurrentCategoryProvider>
      
        <div className="flex flex-col gap-2 w-full relative">
          <div className="dark:prose-invert prose-p:m-0 prose-h2:m-0">
              <p className="text-xs text-muted-foreground">The hot stuff</p>
              <h2 className="dark:prose-invert text-lg font-bold">Popular</h2>
          </div>
          <GeneralSwiper initialData={initialPopular} apiUrl={API_ROUTES.GET_POPULAR_CHARACTERS} component={ImageCharacterCard} rows={1} />
        </div>

        {/* Create new character. Totally not copied the layout from cai */}
        <div className="flex flex-col gap-4 p-6 w-full relative">

          <div className="dark:prose-invert prose-p:m-0 prose-h2:m-0 flex flex-col z-20">
            <h2 className="dark:prose-invert text-lg font-bold">Looking for something else?</h2>
            <p className="text-sm text-white/75">Create your own character and start chatting with it!</p>
          </div>

          <Link href={"/c/new"} className="w-full relative max-w-[15rem] z-20 cursor-pointer">
            <Button  className=" cursor-pointer relative w-full rounded-3xl font-bold p-0 h-fit  " >
              <div className="  size-full z-10 flex items-center justify-between gap-2 py-4 px-6 rounded-3xl">
                <span>Create a character</span>
                <ChevronRightIcon />
              </div>
            </Button>
          </Link>
          <div className="absolute top-0 left-0 size-full rounded-3xl overflow-hidden">
            <div className="absolute top-0 left-0 size-full bg-gradient-to-r from-background/70 via-background/50 to-background/20 backdrop-blur-[1px] z-10"></div>
            <Image 
              alt=""
              fill
              src={"/images/rep.webp"}
              className="object-cover object-center"
            />
          </div>

        </div>

      </div>
    </div>
  );
}
