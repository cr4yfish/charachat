/**
 * Small searchbar card
 * 
 * Just takes a query and redirects to the search page
 * with the query as a parameter.
 */

import { SearchIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Liquid } from "../ui/liquid";

export default function SearchCard() {
    return (
        <Liquid className="rounded-full overflow-hidden relative h-[46px] max-md:hidden">
            <div className="absolute top-0 left-0 h-full flex items-center justify-center pl-4">
                <SearchIcon size={16} />
            </div>
            
            <form
                action="/search"
                method="get"
                className="relative flex items-center justify-center h-full w-full"
            >
                <Input 
                    className="relative rounded-full size-full !ml-10 !bg-transparent !border-none !focus:outline-0 !outline-0 text-white p-0 m-0"
                    placeholder="Search characters"
                    name="q"
                    id="q"
                />
            </form>
        </Liquid>
    );
}