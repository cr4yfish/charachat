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
import { getJanitor, searchJanitor } from "@/functions/serverHelpers";

type CharaterPage = {
    title: string;
    description: string;
    thumbnail?: {
        url: string;
    },
    link: string;
    tags?: string[];
}

type CharacterPageCardProps = {
    page: CharaterPage;
    callback?: (char: CharaterPage) => void;
    isLoading?: boolean;
}

function CharacterPageCard(props: CharacterPageCardProps) {
    const handleCallback = () => {
        if(props.callback) {
            props.callback(props.page);
        }
    }

    return (
        <>
        <NextUICard isDisabled={props.isLoading} isPressable onClick={handleCallback}>
            <NextUICardBody className="flex flex-row gap-2">
                <div>
                    <Avatar src={props.page.thumbnail ? props.page.thumbnail.url : ""} size="lg" alt={props.page.title} />
                </div>
                <div className="flex flex-col gap-1">

                    <span className="font-bold">{props.page.title}</span>

                    <Markdown className="text-xs dark:text-zinc-400">{truncateText(props.page.description, 280)}</Markdown>

                    <div className="flex flex-row flex-wrap gap-1">
                        {props.page.tags?.map((tag, index) => (
                            <span key={index} className="text-xs dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-md px-2 py-1 mr-1">{tag}</span>
                        ))}
                    </div>

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

export default function JanitorImporter(props: Props) {
    const [search, setSearch] = useState<string>("");
    const [characterPage, setCharacterPage] = useState<CharaterPage[]>([]);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isImporting, setIsImporting] = useState<boolean>(false);


    const handleImportCharacter = async (page: CharaterPage) => {
        setIsImporting(true);

        const character: Character = {
            id: uuidv4(),
            name: page.title,
            description: page.description,
            image_link: page.thumbnail ? page.thumbnail.url : "",
            owner: props.profile,
            book: ""
        } as Character;


        // get full page
        const html = await getJanitor("https://jannyai.com/" + page.link);

        // parse html to DOM
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const list = doc.querySelectorAll("li p");
        list.forEach((ele, index) => {
            switch(index) {
                case 1:
                    character.personality = ele.textContent || "";
                    break;
                case 2:
                    character.scenario = ele.textContent || "";
                    break;
                case 3:
                    character.first_message = ele.textContent || "";
                    break;
                case 4:
                    character.book = ele.textContent || "";
                    break;
            }
        })
  
        props.setCharacter(character);
    }

    const handleSearch = async (searchString: string) => {
        setIsLoading(true);
        
        const html = await searchJanitor(searchString);

        // parse html to DOM
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const results = doc.querySelectorAll("body .grid a");

        // get text from all p elements
        const pages = Array.from(results).map((ele,) => {
            const pageTitle = ele.querySelector("h5")?.textContent ?? "";
            const pageDescription = ele.querySelector("p")?.textContent ?? "";
            const pageThumbnail = ele.querySelector("img")?.getAttribute("src");
            const pageLink = ele.getAttribute("href");
            const tags = ele.querySelectorAll("li");

            const tagsArray: string[] = []

            tags.forEach((tag) => {
                const tagContent = tag.querySelector("span")?.textContent;
                if(tagContent) tagsArray.push(tagContent);
            })
            const newPage: CharaterPage = {
                title: pageTitle.replaceAll("\n","").replaceAll("\t",""),
                description: pageDescription.replaceAll("\n","").replaceAll("\t",""),
                thumbnail: {
                    url: pageThumbnail || ""
                },
                link: pageLink || "",
                tags: tagsArray
            }

            return newPage;
        });

        setCharacterPage(pages);
        setIsLoading(false);
    }

    useEffect(() => {
        if(searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            handleSearch(search)
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
                <CardDescription>Import from JanitorAI</CardDescription>
                <CardTitle>Search Janitor Character Cards</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">

                <Input 
                    radius="full" size="lg"
                    startContent={isLoading ? <Spinner size="sm" color="default" /> : <Icon filled>search</Icon>} 
                    placeholder="Search" 
                    value={search} onValueChange={setSearch}
                />          

                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-sm dark:text-zinc-400">Search Results</h3>
                    {characterPage.map((page, index) => (
                        <CharacterPageCard 
                            page={page} 
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