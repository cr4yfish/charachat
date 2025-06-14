"use client";

import { useEffect, useRef, useState } from "react";
import { Character } from "@/types/db";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from "@/components/ui/drawer"
import Icon from "../utils/Icon";
import { searchCharacters } from "@/functions/db/character";
import { Button } from "../utils/Button";
import { useToast } from "@/hooks/use-toast";
import CharacterAvatarButton from "../character/CharacterAvatarButton";

type Props = {
    setCharacters : (characters : Character[]) => void;
    extraCharacters : Character[];
}

export default function ExtraCharacterSelect(props: Props) {
    const [open, setOpen] = useState(false);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [search, setSearch] = useState<string>("");
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const {toast} = useToast();

    useEffect(() => {
        const handleSearch = async () => {
            // fetch the data from the server
            setLoading(true);

            const charactersRes = await searchCharacters(search);
            setCharacters(charactersRes);
            setLoading(false);
        }

        if(searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            handleSearch();
        }, 150);

        return () => {
            if(searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        }

    }, [search])

    const handleSetCharacter = (character : Character) => {
        if(props.extraCharacters.length >= 3) {
            toast({
                title: "Error",
                description: "You can only add three extra Character for now.",
                variant: "destructive"
            })
            setOpen(false);
            return;
        }

        props.setCharacters([...props.extraCharacters, character]);
        setOpen(false);
    }

    return (
        <>
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
        <       Card isPressable className="p-0 bg-transparent shadow-none w-[100px]" >
                    <CardBody className="p-2 flex items-center flex-col gap-2">
                        <div className="min-w-[60px] min-h-[60px] flex items-center justify-center bg-zinc-100 dark:bg-zinc-700 rounded-full">
                            <Icon upscale>add</Icon>
                        </div>
                        <span className="text-xs">Add more</span>
                    </CardBody>
                </Card>
            </DrawerTrigger>
            <DrawerContent className="h-full">
                <DrawerHeader>
                    <DrawerTitle className="flex items-center justify-between px-8">
                        Add Extra Characters
                        <DrawerClose asChild><Button variant="light" isIconOnly><Icon>close</Icon></Button></DrawerClose>
                    </DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-4 px-4 pb-28 h-full">
                    <div className="h-full overflow-y-auto">
                        <div className="flex flex-row flex-wrap gap-2 h-fit">
                            {characters.map((character) => (
                                <CharacterAvatarButton 
                                    key={character.id + "select"} 
                                    character={character} 
                                    onClick={() => handleSetCharacter(character)} 
                                />
                            ))}
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full flex items-center justify-center pb-8 px-4">
                        <Input 
                            startContent={
                                <Icon downscale filled>
                                    {loading ? <Spinner size="sm" color="default" /> : "search"}
                                </Icon>
                            } 
                            label="Search" 
                            radius="full"
                            value={search} 
                            onValueChange={setSearch}
                            className="max-w-xl" 
                        />
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
        </>
    )
}