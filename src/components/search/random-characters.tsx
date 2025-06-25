"use client";
/**
 * Component thats similar to the cs:go case-opening UI.
 * It uses getRandomCharacters() to get a random set of characters and animates a bar over them, stopping at a random character.
 */

/**
 * Usage for Dialog:
 * <Dialog>
    <DialogTrigger>Open</DialogTrigger>
    <DialogContent>
        <DialogHeader>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogDescription>
            This action cannot be undone. This will permanently delete your account
            and remove your data from our servers.
        </DialogDescription>
        </DialogHeader>
    </DialogContent>
    </Dialog>
 */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "../ui/button";
import { motion } from "motion/react";
import { useState } from "react";
import { Character } from "@/lib/db/types/character";
import ImageCharacterCard from "../character/character-card-image";
import useSWR from "swr";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { cn, fetcher, shuffleArray } from "@/lib/utils";
import Spinner from "../ui/spinner";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";

interface RandomCharactersProps {
  onCharacterSelected?: (character: Character) => void;
}

export default function RandomCharacters({ onCharacterSelected }: RandomCharactersProps) {
    const router = useRouter();
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { data: characters, isLoading, isValidating, mutate } = useSWR<Character[]>(API_ROUTES.GET_RANDOM_CHARACTERS, fetcher, {
        revalidateOnFocus: false,
        revalidateOnMount: true,
        revalidateOnReconnect: false,
    })
  const startCaseOpening = () => {
    if (!characters || isLoading || isValidating || characters.length === 0) return;
    
    setIsSpinning(true);
    setSelectedCharacter(null);
    
    // Reset position
    setScrollPosition(0);
    
    // Calculate random stopping position
    // ImageCharacterCard has width of 150px + margins (mx-1 = 8px each side) + padding (p-2 px-1 = 8px each side)
    const cardWidth = 150; // Actual width of ImageCharacterCard
    const cardMarginAndPadding = 16; // mx-1 (8px) + px-1 (8px) on each side
    const totalCardWidth = cardWidth + cardMarginAndPadding;
    
    // Use a more realistic container width (90% of max dialog width)
    const containerWidth = window.innerWidth * 0.9 * 0.9; // 90% of viewport * 90% of dialog
    const centerOffset = containerWidth / 2;
    
    // Pick a random character from the middle section to avoid edge cases
    const minIndex = 8;
    const maxIndex = characters.length - 8
    const randomIndex = Math.floor(Math.random() * (maxIndex - minIndex)) + minIndex;
    
    // Calculate final scroll position to center the selected character
    // Position the center of the selected card at the center of the container
    const cardCenterPosition = randomIndex * totalCardWidth + (totalCardWidth / 2);
    const finalPosition = -(cardCenterPosition - centerOffset);
    
    // Animate the scroll with easing that slows down naturally
    const duration = Math.random() * 2000 + 3000; // 3-5 seconds
    
    setTimeout(() => {
      setScrollPosition(finalPosition);
    }, 100);
    
    // Stop spinning and select character after animation
    setTimeout(() => {
      setIsSpinning(false);
      const selectedChar = characters[randomIndex];
      setSelectedCharacter(selectedChar);
      onCharacterSelected?.(selectedChar);
    }, duration);
  };

  const resetCaseOpening = () => {
    // shuffle characters
    
    if (!characters || isLoading || isValidating || characters.length === 0) return
    const shuffledCharacters = shuffleArray(characters);
    mutate(shuffledCharacters, false); // Update SWR cache without revalidating

    setIsSpinning(false);
    setSelectedCharacter(null);
    setScrollPosition(0);
  };

  const handleOnClick = () => {
    if(selectedCharacter?.id) {
        // Open character
        router.push("/chat?characterid=" + selectedCharacter.id);
    } 
    else {
        startCaseOpening();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="h-[80px] w-[260px] shrink-0 flex flex-row justify-between items-center gap-2 rounded-3xl text-green-900 bg-green-400 p-4 cursor-pointer hover:bg-green-500 transition-all duration-200">
            <div className="flex flex-col gap-1">
                <p className="text-xs">Bored of the selection?</p>
                <div className="flex items-center gap-1">
                    <h2 className="font-bold">🎲 Roll Characters</h2>
                </div>
                
            </div>
            <div className="flex items-center self-end ">
                <ArrowRightIcon color="currentColor" className="self-end" />
            </div>
        </div>
      </DialogTrigger>
      <DialogContent className="overflow-hidden !max-w-[90%] !w-full backdrop-blur-lg bg-background/75">
        <DialogHeader>
          <DialogTitle>Character Roulette</DialogTitle>          
          <DialogDescription>
            Spin the wheel to discover a random character!
          </DialogDescription>
        </DialogHeader>


        {/* Case Opening Container */}
        <div className="relative w-full overflow-hidden">
            {/* Selection Bar - Fixed in center */}

            
            {/* Scrolling Characters Container */}
            <div className="h-64 bg-gradient-to-r from-slate-900/0 via-slate-800/50 to-slate-900/0 rounded-lg overflow-hidden relative">
                <div id="selectionbar" className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-sky-500 to-sky-200 z-20 shadow-lg">
                    {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg animate-pulse" /> */}
                </div>


                {/* Gradient overlays for fade effect */}
                <div className="absolute left-0 top-0 w-28 h-full bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute right-0 top-0 w-28 h-full bg-gradient-to-l from-background to-transparent z-10" />
                
                {/* Characters Strip */}
                <motion.div
                    className="flex h-full items-center"
                    style={{ x: scrollPosition }}
                    animate={{ x: scrollPosition }}
                    transition={{
                    duration: isSpinning ? 4 : 0.5,
                    ease: isSpinning ? [0.25, 0.46, 0.45, 0.94] : "easeOut"
                    }}
                >
                    {characters?.map((character) => (
                    <div key={`${character.id}`} className="flex-shrink-0 mx-1 p-2 px-1">                          
                        <motion.div 
                            className={cn("h-full transition-all duration-300", {
                                "opacity-75": !isSpinning && selectedCharacter?.id && selectedCharacter?.id !== character.id,
                            })}
                            animate={(selectedCharacter?.id === character.id && !isSpinning) ? { 
                                scale: [1, 1.5, 1],
                            } : {}}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                repeatType: "reverse"
                            }}
                        >
                            <ImageCharacterCard
                                data={character}
                            />
                        </motion.div>
                    </div>
                    ))}
                </motion.div>
            </div>

        </div>

        {/* Controls */}
        <div className="flex flex-col justify-center items-center w-full gap-4">
            <Button 
                onClick={handleOnClick}
                variant={"secondary"}
                className="rounded-3xl w-full max-w-md py-6"
                disabled={isSpinning || characters?.length === 0 || isLoading || isValidating}
            >
                {
                isSpinning ? <span className="flex items-center gap-1"> <Spinner /> Spinning the roulette...</span>
                :
                (selectedCharacter != null) ? 
                <span className="flex items-center gap-2">🎉 Chat with {selectedCharacter.name}</span>

                : "🎰 Spin the Roulette"
                }
            </Button>
            
            <Button 
                onClick={resetCaseOpening}
                variant="link"
                disabled={isSpinning || isLoading || isValidating || characters?.length === 0}
            >
                {selectedCharacter ? "🔄 Try again" : "🔄 Shuffle Characters"}
            </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}