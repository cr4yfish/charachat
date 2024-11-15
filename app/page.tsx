"use server";

import CharacterCard from "@/components/character/CharacterCard";
import { Button } from "@/components/utils/Button";
import { getCharacters } from "@/functions/db/character";
import { Character } from "@/types/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {

  let characters: Character[] = [];

  try {
    characters = await getCharacters();
  } catch (error) {
    console.error(error);
    redirect("/error");
  }

  return (
    <div className="font-[family-name:var(--font-geist-sans)] flex flex-col gap-4">
      <Link href={"/c/new"}><Button>New Character</Button></Link>
      <div className="flex flex-wrap gap-4">
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>

    </div>
  );
}
