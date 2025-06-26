"use client";

import { memo, useCallback } from "react";
import { ImportCharType } from "./importer";
import { saveDraftCharacterInCookie } from "@/app/c/new/actions";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ChevronRightIcon } from "lucide-react";
import ImageWithBlur from "@/components/image/imageWithBlur";
import { safeParseLink, truncateText } from "@/lib/utils/text";

const PureResultCard = ({ character, onClick }: { character: ImportCharType, onClick: (char: ImportCharType) => void }) => {

    const handleOnClick = useCallback(() => {
        onClick(character);
    }, [character, onClick]);

    return (
        <li className="cursor-pointer p-2 flex flex-row items-center gap-2 text-white w-full  border-b pb-3"  onClick={handleOnClick} >
            <div className="flex items-center gap-2 h-full w-[90px] rounded-2xl overflow-hidden relative shrink-0 ">
                {character.imageLink && (
                    <ImageWithBlur
                        fill
                        src={safeParseLink(character.imageLink)}
                        alt={character.name}
                        sizes="40px"
                        aspectRatio={3/4}
                        // is_nsfw={character.nsfw || false}
                    />
                )}
            </div>
            <div className="flex flex-col gap-1 justify-between overflow-hidden w-full min-h-full">
                <span>{truncateText(character.name, 48)}</span>
                {character.description && <span className="text-xs text-muted-foreground">{truncateText(character.description, 80)}</span>}
                <div className="flex w-full h-[35px] overflow-x-auto gap-1 pb-1">
                    {character.tags?.map((tag, index) => (
                        <Badge
                            key={`tag-${index}-${tag}`}
                            className="text-xs bg-neutral-800/50 text-muted-foreground rounded-full"
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>
            
            <span className="text-muted-foreground"><ChevronRightIcon size={14} /></span>
        </li>
    )
}

const ResultCard = memo(PureResultCard, (prevProps, nextProps) => {
    // Only re-render if the character prop changes
    return prevProps.character.name === nextProps.character.name;
});

type Props = {
    searchResults: ImportCharType[];
}

const PureImporterSearchResults = ({ searchResults }: Props) => {
    const router = useRouter();

    const handleSelectCharacter = (char: ImportCharType) => {
        saveDraftCharacterInCookie({
            id: uuidv4(), // Generate a new ID for the draft character
            name: char.name,
            description: char.description,
            image_link: char.imageLink,
            is_private: false,
            bio: char.tags ? ("Tags:\n\n" + char.tags?.join(", ")): "",
            is_nsfw: char.nsfw || false,
        }).then(() => {
            // Optionally, you can add any additional logic after saving the character
            router.push("/c/new?isImport=true"); // Redirect to the character page
        }).catch((error) => {
            console.error("Error saving character to draft:", error);
        });
    }

    return (
        <div className="w-full flex flex-col gap-2 max-h-full relative overflow-y-hidden px-4">
            {searchResults.length === 0 ? (
                <p className="text-muted-foreground text-xs italic mt-[175px] text-center w-full ">No results found.</p>
            ) : (
                <ul className="space-y-2 w-full relative h-full max-h-full overflow-y-auto pt-[135px] pb-[175px]">
                    {searchResults.map((character) => (
                        <ResultCard
                            key={`${character.name}-${character.imageLink}-${character.sourceId}`}
                            character={character}
                            onClick={handleSelectCharacter}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}

export const ImporterSearchResults = memo(PureImporterSearchResults, (prevProps, nextProps) => {
    // Only re-render if the searchResults or onCharacterSelected changes
    return prevProps.searchResults === nextProps.searchResults;
});