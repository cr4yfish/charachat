"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Card as NextUICard, CardBody as NextUICardBody } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import Icon from "@/components/utils/Icon";
import { Spinner } from "@nextui-org/spinner";
import Markdown from "react-markdown";
import { Avatar } from "@nextui-org/avatar";
import { truncateText } from "@/lib/utils";
import { Character, Persona, Profile } from "@/types/db";

const query = `
    query ($search: String!) {
        Page {
            characters(search: $search) {
                id,
                name {
                    full
                },
                image {
                    medium
                },
                description,
                media {
                    nodes {
                        title {
                            romaji
                        },
                        description,
                        type
                    }
                }
            }
        }
    }
`
const url = "https://graphql.anilist.co";

type AnimeChar = {
    id: number;
    name: {
        full: string;
    };
    image: {
        medium: string;
    };
    description: string;
    media: {
        nodes: Array<{
            title: {
                romaji: string;
            },
            type: string;
            description: string;
        }>
    },
    gender: string,
    dateOfBirth: {
        year: number;
        month: number;
        day: number;
    }
}


type AnimeCharCardProps = {
    character: AnimeChar;
    callback?: (char: AnimeChar) => void;
}

function AnimeCharCard(props: AnimeCharCardProps) {
    const handleCallback = () => {
        if(props.callback) {
            props.callback(props.character);
        }
    }

    return (
        <>
        <NextUICard isPressable onClick={handleCallback}>
            <NextUICardBody className="flex flex-row gap-2">
                <div>
                    <Avatar src={props.character.image.medium} size="lg" alt={props.character.name.full} />
                </div>
                <div className="flex flex-col">
                    <div className="flex flex-col">
                        <span className="text-xs dark:text-zinc-400">{props.character.media.nodes[0].title.romaji}</span>
                        <span className="font-bold">{props.character.name.full}</span>
                    </div>
                   
                    <Markdown className="text-xs dark:text-zinc-400">{truncateText(props.character.description, 280)}</Markdown>
                </div>
            </NextUICardBody>
        </NextUICard>
        </>
    )
}

type Props = {
    setCharacter?: (character: Character) => void;
    setPersona?: (persona: Persona) => void;
    profile: Profile;
}

export default function AnimeImport(props: Props) {
    const [search, setSearch] = useState<string>("");
    const [animeCharacters, setAnimeCharacters] = useState<AnimeChar[]>([]);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);



    const handleImportCharacter = (char: AnimeChar) => {
        // convert to Character and update upstream

        if(props.setCharacter) {
            const character: Character = {
                id: uuidv4(),
                name: char.name.full,
                description: char.description,
                image_link: char.image.medium,
                owner: props.profile,
                book: `${char.media.nodes[0].type}: ${char.media.nodes[0].title.romaji} Description: ${char.media.nodes[0].description}`,
            } as Character;

            props.setCharacter(character);
    
        } else if(props.setPersona) {

            const persona: Persona = {

            } as Persona;

            props.setPersona(persona);

        }

    }

    const handleSearch = async (searchString: string) => {
        setIsLoading(true);
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                query: query,
                variables: {
                    search: searchString
                }
            })
        })

        if(res.status == 200) {
            const json = await res.json();
            setAnimeCharacters(json.data.Page.characters);
        } else {
            console.error("Error fetching data");
        }
        setIsLoading(false);
    }

    useEffect(() => {
        if(searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            if(search.length == 0) {
                // reset results
                setAnimeCharacters([]);
            } else {
                handleSearch(search);
            }
        }, 500);

        return () => {
            if(searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        }
    }, [search])

    return (
        <>
        <Card className="w-full">
            <CardHeader>
                <CardDescription>Import from Anime</CardDescription>
                <CardTitle>Search Character</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">

                <Input 
                    radius="full" size="lg"
                    startContent={isLoading ? <Spinner size="sm" color="default" /> : <Icon filled>search</Icon>} 
                    placeholder="Search Character name" 
                    value={search} onValueChange={setSearch}
                />          

                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-sm dark:text-zinc-400">Search Results</h3>
                    {animeCharacters.map((char, index) => (
                        <AnimeCharCard 
                            character={char} 
                            callback={handleImportCharacter}
                            key={index} 
                        /> 
                    ))}
                </div>
            
            </CardContent>
            <CardFooter>

            </CardFooter>
                    </Card>
        </>
    )
}