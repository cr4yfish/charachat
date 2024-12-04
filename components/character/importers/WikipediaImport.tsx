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
import { Character, Profile } from "@/types/db";


const url = 'https://en.wikipedia.org/w/rest.php/v1/search/page?q=';

type WikiPage = {
    id: number;
    title: string;
    description: string;
    expert: string;
    thumbnail?: {
        url: string;
    }
}

type WikiPageCardProps = {
    wikipage: WikiPage;
    callback?: (char: WikiPage) => void;
    isLoading?: boolean;
}

function WikiPageCard(props: WikiPageCardProps) {
    const handleCallback = () => {
        if(props.callback) {
            props.callback(props.wikipage);
        }
    }

    return (
        <>
        <NextUICard isDisabled={props.isLoading} isPressable onClick={handleCallback}>
            <NextUICardBody className="flex flex-row gap-2">
                <div>
                    <Avatar src={props.wikipage.thumbnail ? props.wikipage.thumbnail.url : ""} size="lg" alt={props.wikipage.title} />
                </div>
                <div className="flex flex-col">
                    <div className="flex flex-col">
                        <span className="font-bold">{props.wikipage.title}</span>
                    </div>
                   
                    <Markdown className="text-xs dark:text-zinc-400">{truncateText(props.wikipage.description, 280)}</Markdown>
                </div>
            </NextUICardBody>
        </NextUICard>
        </>
    )
}

type Props = {
    setCharacter: (character: Character) => void;
    profile: Profile;
}

export default function WikipediaImport(props: Props) {
    const [search, setSearch] = useState<string>("");
    const [wikiPages, setWikiPages] = useState<WikiPage[]>([]);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isImporting, setIsImporting] = useState<boolean>(false);


    const handleImportCharacter = async (page: WikiPage) => {
        setIsImporting(true);

        // get full page
        const res = await fetch("https://en.wikipedia.org/w/rest.php/v1/page/" + page.title, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            
        })

        let book = "";
        
        if(res.status == 200) {
            const json = await res.json();
            book = json.source;
        } else {
            console.error("Error fetching data");
        }

        // regex to match {{  }} with whitespace, text and nested {{ }} inside
        book = book.replace(/{{([^{}]*({{[^{}]*}}[^{}]*)*)}}/g, "");

        // regex remove all lines with | at start
        book = book.replace(/^\|.*$/gm, "");

        // remove {{ }} until no match
        while(/{{[^{}]*}}/.test(book)) {
            book = book.replace(/{{[^{}]*}}/g, "");
        }

        // regex remove all lines with no text
        book = book.replace(/^\s*$/gm, "");

        book = book.slice(0,1000);
        
        // convert to Character and update upstream
        const character: Character = {
            id: uuidv4(),
            name: page.title,
            description: page.description,
            image_link: page.thumbnail ? page.thumbnail.url : "",
            owner: props.profile,
            book: book
         } as Character;

        props.setCharacter(character);

    }

    const handleSearch = async (searchString: string) => {
        setIsLoading(true);
        const res = await fetch(url + searchString, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            
        })

        if(res.status == 200) {
            const json = await res.json();
            setWikiPages(json.pages);
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
            handleSearch(search);
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
                <CardDescription>Import from Wikipedia</CardDescription>
                <CardTitle>Search Wikipedia</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">

                <Input 
                    radius="full" size="lg"
                    startContent={isLoading ? <Spinner size="sm" color="default" /> : <Icon filled>search</Icon>} 
                    placeholder="Search Wikipedia Article" 
                    value={search} onValueChange={setSearch}
                />          

                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-sm dark:text-zinc-400">Search Results</h3>
                    {wikiPages.map((page, index) => (
                        <WikiPageCard 
                            wikipage={page} 
                            callback={handleImportCharacter}
                            key={index} 
                            isLoading={isImporting}
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