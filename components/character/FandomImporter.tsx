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
import { getFandomPage, searchFandomPages } from "@/functions/serverHelpers";

type FandomPage = {
    title: string;
    description: string;
    thumbnail?: {
        url: string;
    },
    link: string;
    fandom: string;
}

type FandomPageProps = {
    fandompage: FandomPage;
    callback?: (char: FandomPage) => void;
    isLoading?: boolean;
}

function FandomPageCard(props: FandomPageProps) {
    const handleCallback = () => {
        if(props.callback) {
            props.callback(props.fandompage);
        }
    }

    return (
        <>
        <NextUICard isDisabled={props.isLoading} isPressable onClick={handleCallback}>
            <NextUICardBody className="flex flex-row gap-2">
                <div>
                    <Avatar src={props.fandompage.thumbnail ? props.fandompage.thumbnail.url : ""} size="lg" alt={props.fandompage.title} />
                </div>
                <div className="flex flex-col">
                    <div className="flex flex-col">
                        <span className="text-xs dark:text-zinc-400">{props.fandompage.fandom}</span>
                        <span className="font-bold">{props.fandompage.title}</span>
                    </div>
                   
                    <Markdown className="text-xs dark:text-zinc-400">{truncateText(props.fandompage.description, 280)}</Markdown>
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

export default function FandomImporter(props: Props) {
    const [search, setSearch] = useState<string>("");
    const [fandomPages, setFandomPages] = useState<FandomPage[]>([]);
    const searchTimeout = useRef<NodeJS.Timeout>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isImporting, setIsImporting] = useState<boolean>(false);


    const handleImportCharacter = async (page: FandomPage) => {
        setIsImporting(true);

        // get full page
        console.log("Importing from:",page.link);
        const html = await getFandomPage(page.link);

        // parse html to DOM
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const contentContainer = doc.querySelector(".mw-parser-output");

        // get all p elements
        const paragraphs = contentContainer?.querySelectorAll("p");

        let book = "";

        paragraphs?.forEach((p) => {
            let text = p.textContent || "";
            text = text.replaceAll("\n","").replaceAll("\t","");

            book += text;
        })

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
        
        const html = await searchFandomPages(searchString);

        // parse html to DOM
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // get div with class "mw-parser-output" and all p elements inside of that
        
        const results = doc.querySelectorAll(".unified-search__result");

        console.log(results)
        // get text from all p elements
        const pages = Array.from(results).map((ele,) => {
            const pageTitle = ele.querySelector(".unified-search__result__title")?.textContent ?? "";
            const pageDescription = ele.querySelector(".unified-search__result__content")?.textContent ?? "";
            const pageThumbnail = ele.querySelector(".unified-search__result__title")?.getAttribute("data-thumbnail");
            const pageLink = ele.querySelector(".unified-search__result__title")?.getAttribute("href");

            // remove everything after .jpg in pageThumbnail
            let url = "";
            let format = "";

            if(pageThumbnail?.includes(".jpg")) {
                format = ".jpg";
            } else if(pageThumbnail?.includes(".png")) {
                format = ".png";
            }
            url = pageThumbnail?.split(format)[0] + format;

            const newPage: FandomPage = {
                title: pageTitle.replaceAll("\n","").replaceAll("\t",""),
                description: pageDescription.replaceAll("\n","").replaceAll("\t",""),
                thumbnail: {
                    url: url || ""
                },
                link: pageLink || "",
                fandom: new URL(pageLink || "").hostname
            }

            return newPage;
        });

        setFandomPages(pages);
        setIsLoading(false);
    }

    useEffect(() => {
        if(searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            if(search.length == 0) {
                // reset results
                setFandomPages([]);
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
                <CardDescription>Import from Fandom</CardDescription>
                <CardTitle>Search Fandom</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">

                <Input 
                    radius="full" size="lg"
                    startContent={isLoading ? <Spinner size="sm" color="default" /> : <Icon filled>search</Icon>} 
                    placeholder="Search Fandom Page" 
                    value={search} onValueChange={setSearch}
                />          

                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-sm dark:text-zinc-400">Search Results</h3>
                    {fandomPages.slice(0,10).map((page, index) => (
                        <FandomPageCard 
                            fandompage={page} 
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