"use server";

import CharacterCard from "@/components/character/CharacterCard";
import { Button } from "@/components/utils/Button";
import { getCharacters } from "@/functions/db/character";
import { Character } from "@/types/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import Icon from "@/components/utils/Icon";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { Separator } from "@/components/ui/separator";

import { Avatar } from "@nextui-org/avatar";
import { getCurrentUser } from "@/functions/db/auth";
import ProfileCard from "@/components/user/ProfileCard";

export default async function Home() {

  let characters: Character[] = [];
  const profile = await getCurrentUser();

  try {
    characters = await getCharacters();
  } catch (error) {
    console.error(error);
    redirect("/error");
  }

  return (
    <div className="font-[family-name:var(--font-geist-sans)] flex flex-col gap-4 px-4 py-6">

      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Charai</h1>
        <Sheet>
          <SheetTrigger>
            <Avatar size="md" src={profile.avatar_link} />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="text-start">Hi, {profile.first_name}</SheetTitle>
              <SheetDescription>

              </SheetDescription>
            </SheetHeader>

            <div className="h-full flex flex-col gap-2 justify-between pb-10">
            
              <div className="flex flex-col gap-4">
                <Separator orientation={"horizontal"} />
                <div className="flex flex-col gap-3">
                  <Link href={`/user/${profile.user}/chats`}>
                    <Button fullWidth size="lg" variant="ghost" startContent={<Icon >chat</Icon>}>Your chats</Button>
                  </Link>
                  <Link href={`/user/${profile.user}/characters`}>
                    <Button fullWidth size="lg" variant="ghost" startContent={<Icon >people</Icon>}>Your Characters</Button>
                  </Link>
                </div>
        
              </div>
              <div className=" flex flex-col gap-4">
                <div className="w-full flex items-start">
                  <ProfileCard profile={profile}  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button color="warning" variant="flat" size="lg" startContent={<Icon filled>edit</Icon>}>Edit Profile</Button>
                  <Button color="danger" variant="flat" size="lg" startContent={<Icon filled>logout</Icon>}>Log out</Button>
                </div>

              </div>
              
            </div>
 
          </SheetContent>
        </Sheet>

      </div>
      
      
      <div className="flex flex-col gap-2">
        <h2 className="dark:prose-invert text-xl font-bold">Popular</h2>
        <ScrollShadow orientation={"horizontal"} className="overflow-x-auto">
          <div className="w-fit flex flex-row gap-4 pr-10 pb-4">
            {characters.map((character) => (
              <CharacterCard hasLink key={character.id} character={character} />
            ))}
          </div>
        </ScrollShadow>
      </div>


      <div className="flex flex-col gap-2">
        <h2 className="dark:prose-invert text-xl font-bold">New</h2>
        <ScrollShadow orientation={"horizontal"} className="overflow-x-auto">
          <div className="w-fit flex flex-row gap-4 pr-10 pb-4">
            {characters.map((character) => (
              <CharacterCard hasLink key={character.id} character={character} />
            ))}
          </div>
        </ScrollShadow>
      </div>

      <Link href={"/c/new"}><Button startContent={<Icon filled>add</Icon>} fullWidth size="lg" color="primary" variant="shadow">New Character</Button></Link>

    </div>
  );
}
