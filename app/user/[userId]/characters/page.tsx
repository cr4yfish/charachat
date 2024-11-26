"use server";

import Link from "next/link";

import { Button } from "@/components/utils/Button";
import Icon from "@/components/utils/Icon";

import { getUserCharacters } from "@/functions/db/character";
import CharacterCard from "@/components/character/CharacterCard";
import InfiniteListLoader from "@/components/InfiniteListLoader";

export default async function UserCharacters() {

    const characters = await getUserCharacters({ cursor: 0, limit: 5 });

    return (
        <>
        <div className="flex flex-col gap-4 px-4 py-6 h-full w-full pb-20">
            <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">Your Characters</h1>
                </div>
                
                <Link href={"/c/new"}>
                    <Button variant="light" color="warning">
                        <Icon>add</Icon>
                        <span className=" max-md:hidden ">Add Character</span>
                    </Button>
                </Link>
                
            </div>

            <InfiniteListLoader 
                initialData={characters}
                limit={5}
                loadMore={getUserCharacters}
                component={CharacterCard}
                componentProps={{ fullWidth: true, hasLink: true }}
            />

         
        </div>
        </>
    )
}