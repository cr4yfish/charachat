"use server";

import { getNewestCharacter } from "@/functions/db/character";
import Spotlight from "../Spotlight";



export default async function SpotlightLoader() {

    const character = await getNewestCharacter();

    return (
        <>
        <Spotlight character={character} />
        </>
    )
}