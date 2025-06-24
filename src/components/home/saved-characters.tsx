import { getBookmarkedCharacters } from "@/lib/db/character";
import { LIMITS } from "@/lib/constants/limits";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import ImageCharacterCard from "../character/character-card-image";

export default async function SavedCharacters() {

    const savedChars = await getBookmarkedCharacters({
        cursor: 0,
        limit: LIMITS.MAX_CHARACTERS_PER_PAGE // Adjust the limit as needed
    });

    return (
        <div className="flex flex-col">
            <h2 className="text-lg font-bold">Saved Characters</h2>

            <div>
                <Carousel>
                    <CarouselContent>
                        {savedChars.map((char) => (
                            <CarouselItem key={char.id}>
                                <ImageCharacterCard
                                    data={char}
                                    hasLink={true}
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </div>
    );
}