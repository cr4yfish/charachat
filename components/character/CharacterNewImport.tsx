"use client";

import { Character, Profile } from "@/types/db";
import { v4 as uuidv4 } from "uuid";
import {Tabs, Tab} from "@nextui-org/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Card as NextUICard, CardBody as NextUICardBody } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import Icon from "../utils/Icon";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@nextui-org/spinner";
import Markdown from "react-markdown";
import { Avatar } from "@nextui-org/avatar";
import { truncateText } from "@/lib/utils";

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

type Props = {
    character: Character;
    setCharacter: (character: Character) => void;
    profile: Profile;
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

export default function CharacterNewImport(props: Props) {
    const [search, setSearch] = useState<string>("");
    const [animeCharacters, setAnimeCharacters] = useState<AnimeChar[]>([]);
    const searchTimeout = useRef<NodeJS.Timeout>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleImportCharacter = (char: AnimeChar) => {
        // convert to Character and update upstream

        const character: Character = {
            id: uuidv4(),
            name: char.name.full,
            description: char.description,
            image_link: char.image.medium,
            owner: props.profile,
            book: `${char.media.nodes[0].type}: ${char.media.nodes[0].title.romaji} Description: ${char.media.nodes[0].description}`,
        } as Character;

        props.setCharacter(character);

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
        <div className="flex flex-col gap-2 w-full">
            <h1 className="text-xl font-bold">Import</h1>
            
            <Tabs className="w-full">
                <Tab title="Anime" className="w-full">
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
                                {animeCharacters.slice(0,10).map((char, index) => (
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
                </Tab>
                <Tab title="Book">
                    <span>Not implemented yet.</span>
                </Tab>
                <Tab title="C.ai">
                    <span>Not implemented yet.</span>
                </Tab>
                <Tab title="Silly Tavern">
                    <span>Not implemented yet.</span>
                </Tab>
            </Tabs>
        </div>
        
        </>
    )
}