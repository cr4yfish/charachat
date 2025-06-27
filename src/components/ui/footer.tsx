import { BotIcon } from "lucide-react";
import Link from "next/link";
import { Separator } from "./separator";


export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full flex flex-col gap-6 pt-4">

            <Separator />
            <div className="w-full flex items-start max-md:flex-col gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-bold text-white/90 font-leckerli text-lg ">
                    <BotIcon />
                    <span className="text-trim">Charachat</span> 
                </span>

                <div className="flex flex-col gap-3 sm:gap-2">
                    <span className="font-medium text-white/90 ">About Charachat</span>
                    <Link className="hover:underline" href={"https://www.reddit.com/r/Charachat"}  target="_blank">Reddit</Link>
                    <Link className="hover:underline" href={"https://discord.gg/2HqqwcwGCy"}  target="_blank">Discord</Link>
                    <Link className="hover:underline" href={"https://github.com/cr4yfish/charachat"}  target="_blank">GitHub</Link>
                </div>

                <div className="flex flex-col gap-3 sm:gap-2">
                    <span className="font-medium text-white/90">Resources</span>
                    <Link className="hover:underline" href={"https://github.com/cr4yfish/charachat/blob/v2/README.md"} target="_blank">About Charachat</Link>
                    <Link className="hover:underline" href={"/pricing"}>Pricing</Link>
                    <Link className="hover:underline" href={"/"}>Explore</Link>
                    <Link className="hover:underline" href={"/search"}>Search</Link>
                </div>

                <span>© {currentYear} Charachat</span>
            </div>
        </footer>
    );
}