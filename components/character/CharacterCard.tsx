"use server";

import Link from "next/link";
import { Image } from "@nextui-org/image";
import { Card, CardBody } from "@nextui-org/card";
import { Character } from "@/types/db";
import Icon from "../utils/Icon";

export default async function CharacterCard({ character, settings={ size: "normal" } } : { character: Character, settings?: { size: "normal" | "small" } }) {

    return (
        <>
        <Link href={`/c/${character.id}`}>
            <Card isPressable>
                { settings.size == "normal" &&
                    <CardBody className="flex flex-row">
                        <div>
                            <Image src={character.avatarUrl} alt={character.name} />
                        </div>
                        <div className="flex flex-col justify-between">
                            <div className="flex flex-col">
                                <div className="flex flex-col">
                                    <div className="flex flex-col">
                                        <h3>{character.name}</h3>
                                        <span className="text-tiny">By @{character.owner.username}</span>
                                    </div>
                                </div>
                                <p>{character.description}</p>
                            </div>
                            <div className="flex flex-row gap-2">
                                <span className="flex items-center gap-1"><Icon>chat_bubble</Icon> 30.0m</span>
                            </div>
                        </div>
                    </CardBody>
                }
                { settings.size == "small" &&
                    <CardBody className="flex flex-row">
                        <div>
                            <Image radius="full" src={character.avatarUrl} alt={character.name} />
                        </div>
                        <div className="flex flex-col justify-between">
                            <div className="flex flex-col">
                                <div className="flex flex-col">
                                    <div className="flex flex-col">
                                        <h3>{character.name}</h3>
                                        <span className="text-tiny">By @{character.owner.username}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2">
                                <span className="flex items-center gap-1"><Icon filled>chat_bubble</Icon> 30.0m</span>
                            </div>
                        </div>
                    </CardBody>
                }   
            </Card>
        </Link>
        </>
    )
}