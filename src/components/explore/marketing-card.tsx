"use client";

import { ArrowRightIcon } from "lucide-react";
import { CarouselItem } from "../ui/carousel";
import { useAuth } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ComparisonTable from "../marketing/comparison-table";

function MarketingCard() {
    const { isSignedIn } = useAuth();

    if(isSignedIn) return null;

    return (
        <CarouselItem className="min-lg:basis-1/3">
            <Dialog>
            <DialogTrigger asChild>                
                <div className="flex flex-row justify-between items-center gap-2 rounded-3xl text-emerald-200/80 bg-emerald-800 p-4 cursor-pointer hover:bg-emerald-700 transition-all duration-200">
                    <div className="flex flex-col gap-1">
                        <p className="text-xs">🔒 Your Privacy Matters</p>
                        <div className="flex items-center gap-1">
                            <h2 className="font-bold text-white/90">End-to-End Encrypted</h2>
                        </div>
                        
                    </div>
                    <div className="flex items-center self-end ">
                        <ArrowRightIcon color="currentColor" className="self-end" />
                    </div>
                </div>
            </DialogTrigger>            
            <DialogContent className="max-w-md max-h-screen max-sm:h-screen">
                <DialogHeader>
                    <DialogTitle>🔒 Why Charachat is Different</DialogTitle>
                    <DialogDescription>
                        Your conversations deserve real privacy and security
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 overflow-y-auto size-full relative">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                            🔐 End-to-End Encryption
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Your messages are encrypted to the highest standard (AES-256). Even I can&apos;t read them - they&apos;re completely private to you.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                            ⭐ Open Source Freedom
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Choose from 10+ AI providers (OpenAI, Claude, Gemini etc.). No vendor lock-in. Full transparency.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                            🛡️ Privacy by Design
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Unlike other platforms, your data cannot get sold or analyzed. What you chat stays between you and your AI.
                        </p>
                    </div>                   
                    <ComparisonTable />

                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground text-center">
                            Ready to experience truly private AI conversations?
                        </p>
                    </div>
                </div>

            </DialogContent>
            </Dialog>

        </CarouselItem>
    );
}

export default MarketingCard;