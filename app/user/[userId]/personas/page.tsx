"use server";

import Link from "next/link";

import { Button } from "@/components/utils/Button";
import Icon from "@/components/utils/Icon";

import InfiniteListLoader from "@/components/InfiniteListLoader";
import { getUserPersonas } from "@/functions/db/personas";
import PersonaCard from "@/components/persona/PersonaCard";

export default async function UserCharacters() {

    const personas = await getUserPersonas(0, 5);

    return (
        <>
        <div className="flex flex-col gap-4 px-4 py-6 h-full w-full pb-20">
            <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">Your Personas</h1>
                </div>
                
                <Link href={"/persona/new"}>
                    <Button variant="light" color="warning">
                        <Icon>add</Icon>
                        <span className=" max-md:hidden ">Add Persona</span>
                    </Button>
                </Link>
                
            </div>

            <InfiniteListLoader 
                initialData={personas}
                limit={5}
                loadMore={getUserPersonas}
                component={PersonaCard}
                componentProps={{ fullWidth: true, hasLink: true }}
            />

         
        </div>
        </>
    )
}