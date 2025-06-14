"use client";

import { getCharacter } from "@/functions/db/character";
import { safeParseLink, truncateText } from "@/lib/utils";
import { Character } from "@/types/db";
import { useEffect, useState } from "react";
import ConditionalLink from "../utils/ConditionalLink";

type Props = {
    characterId?: string | undefined;
    character?: Character | undefined;
    onClick?: () => void;
    disableButton?: boolean;
    hasLink?: boolean;
}

export default function CharacterAvatarButton(props: Props) {
    const [character, setCharacter] = useState<Character>({} as Character);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchCharacter = async () => {
            if(!props.characterId) return;
            setIsLoading(true);
            const res = await getCharacter(props.characterId);
            setCharacter(res);
            setIsLoading(false);
        }
        if(!props.character && props.characterId && !character.id) {
            fetchCharacter();
        }

        if(props.character) {
            setCharacter(props.character);
        }

    }, [props.characterId, props.character, character.id])

    return (
        <>
        <ConditionalLink active={props.hasLink ?? false} href={`/c/${character?.id}`}>
        <Card 
            key={props.characterId + "select"} 
            className="p-0 bg-transparent shadow-none hover:bg-zinc-200 dark:hover:bg-zinc-700 w-[100px]" 
            isPressable={props.disableButton ? false : true}
            isDisabled={isLoading}
            onClick={props.onClick}
        >
            <CardBody className="p-2 flex items-center flex-col gap-2">
                <Avatar size="lg" src={safeParseLink(character.image_link)} />
                <span className="text-xs text-center w-full">{truncateText(character.name, 15)}</span>
            </CardBody>
        </Card>
        </ConditionalLink>
        </>
    )
}