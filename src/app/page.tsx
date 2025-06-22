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

      <div className="flex flex-col gap-4 px-4 py-6 pt-1">

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

        <div>
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
        <div className="flex flex-col items-center gap-6 pt-6 w-full relative px-4">

          <div className="dark:prose-invert prose-p:m-0 prose-h2:m-0 flex flex-col items-center justify-center text-center">
            <h2 className="dark:prose-invert text-lg font-bold">Looking for something else?</h2>
            <p className="text-xs text-muted-foreground">Create your own character and start chatting with it!</p>
          </div>

          <Link href={"/c/new"} className="w-full relative max-w-xs">
            <Button variant={"secondary"} className=" relative w-full rounded-3xl font-bold p-0 h-fit  " >
              <div className="animated-shadow pointer-events-none absolute size-full left-0 bottom-0 rounded-3xl"></div>
              <div className=" bg-white text-black size-full z-10 flex items-center justify-center gap-2 py-4 rounded-3xl">
                <span>Create a character</span>
              </div>
            </Button>
          </Link>

        </div>

      </div>
    </div>
  );
}
