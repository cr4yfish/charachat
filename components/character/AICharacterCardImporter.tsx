"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Card as NextUICard, CardBody as NextUICardBody } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import Icon from "../utils/Icon";
import { Spinner } from "@nextui-org/spinner";
import Markdown from "react-markdown";
import { Avatar } from "@nextui-org/avatar";
import { truncateText } from "@/lib/utils";
import { Character, Profile } from "@/types/db";
import { getAICharacterCard, searchAICharacterCards } from "@/functions/serverHelpers";

type CharaterPage = {
    title: string;
    description: string;
    thumbnail?: {
        url: string;
    },
    link: string;
    sfw: boolean
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
                <div className="flex flex-col">
                    <div className="flex flex-col">
                        <span className="text-xs dark:text-zinc-400">{props.page.sfw ? "SFW": "NSFW"}</span>
                        <span className="font-bold">{props.page.title}</span>
                    </div>
                   
                    <Markdown className="text-xs dark:text-zinc-400">{truncateText(props.page.description, 280)}</Markdown>
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

export default function AICharacterCardsImporter(props: Props) {
    const [search, setSearch] = useState<string>("");
    const [characterPage, setCharacterPage] = useState<CharaterPage[]>([]);
    const searchTimeout = useRef<NodeJS.Timeout>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isImporting, setIsImporting] = useState<boolean>(false);


    const handleImportCharacter = async (page: CharaterPage) => {
        setIsImporting(true);

        // get full page
        const html = await getAICharacterCard(page.link);

        // parse html to DOM
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const contentContainer = doc.querySelector(".brz-accordion ");
        const accordions = contentContainer?.querySelectorAll(".brz-accordion__item");

        // convert to Character and update upstream
        const character: Character = {
            id: uuidv4(),
            name: page.title,
            description: page.description,
            image_link: page.thumbnail ? page.thumbnail.url : "",
            owner: props.profile,
            book: ""
        } as Character;


        accordions?.forEach((accordion) => {
            const accordionTitle = accordion.querySelector(".brz-accordion__nav span")?.textContent;
            const content = accordion.querySelector(".brz-accordion__content .brz-embed-content div")?.textContent;
            switch(accordionTitle) {
                case "Character Name":
                    character.name = content ?? "";
                    break;
                case "Character Description":
                    character.description = content ?? "";
                    break;
                case "Character Personality":
                    character.personality = content ?? "";
                    break;
                case "Character First Message":
                    character.intro = content ?? "";
                    break;
                case "Character Scenario":
                    character.book = content ?? "";
                    break;
            }
        })
  
        props.setCharacter(character);
    }

    const handleSearch = async (searchString: string) => {
        setIsLoading(true);
        
        const html = await searchAICharacterCards(searchString);

        // parse html to DOM
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const results = doc.querySelectorAll(".list-group a");

        // get text from all p elements
        const pages = Array.from(results).map((ele,) => {
            const pageTitle = ele.querySelector("h5")?.textContent ?? "";
            const pageDescription = ele.querySelector("p")?.textContent ?? "";
            const pageThumbnail = ele.querySelector("img")?.getAttribute("src");
            const pageLink = ele.getAttribute("href");
            const tags = ele.querySelectorAll("small");
            let isSFW = true;

            tags.forEach((tag) => {
                if(tag.textContent?.toLowerCase().includes("nsfw")) {
                    isSFW = false;
                }
            })

            // remove everything after .jpg in pageThumbnail
            let url = "";
            let format = "";

            if(pageThumbnail?.includes(".jpg")) {
                format = ".jpg";
            } else if(pageThumbnail?.includes(".png")) {
                format = ".png";
            }
            url = pageThumbnail?.split(format)[0] + format;

            const newPage: CharaterPage = {
                title: pageTitle.replaceAll("\n","").replaceAll("\t",""),
                description: pageDescription.replaceAll("\n","").replaceAll("\t",""),
                thumbnail: {
                    url: url || ""
                },
                link: pageLink || "",
                sfw: isSFW
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
            if(search.length == 0) {
                // reset results
                setCharacterPage([]);
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
                <CardDescription>Import from AI Character Cards / SillyTavern</CardDescription>
                <CardTitle>Search AI Character Cards</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">

                <Input 
                    radius="full" size="lg"
                    startContent={isLoading ? <Spinner size="sm" color="default" /> : <Icon filled>search</Icon>} 
                    placeholder="Search AI Character Cards" 
                    value={search} onValueChange={setSearch}
                />          

                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-sm dark:text-zinc-400">Search Results</h3>
                    {characterPage.slice(0,10).map((page, index) => (
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