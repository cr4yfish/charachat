"use server";

import Link from "next/link";

import { Button } from "@/components/utils/Button";
import Icon from "@/components/utils/Icon";

import InfiniteListLoader from "@/components/InfiniteListLoader";
import { getUserPersonas } from "@/functions/db/personas";
import PersonaCard from "@/components/persona/PersonaCard";

export default async function UserCharacters() {

    const personas = await getUserPersonas({ cursor: 0, limit: 25 });

    return (
        <>
        <div className="flex flex-col gap-4 px-4 py-6 h-full w-full pb-20">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col items-start gap-2">
                    <h1 className="text-2xl font-bold">Your Personas</h1>
                    <p>You can use Personas to change how the AI refers to you. For example if you create a persona "Donald Duck", and select it when creating a new Chat, then the AI will think you&apos;re Donald Duck.</p>
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