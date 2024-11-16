import { Image } from "@nextui-org/image";
import { Card, CardBody } from "@nextui-org/card";
import { Character } from "@/types/db";
import Icon from "../utils/Icon";
import ConditionalLink from "../utils/ConditionalLink";

type Props = {
    character: Character,
    hasLink: boolean,
    fullWidth?: boolean
}

export default function CharacterCard(props: Props) {

    return (
        <>
        <ConditionalLink active={props.hasLink} href={`/c/${props.character.id}`}>
            <Card isPressable={props.hasLink} className={`h-full w-[300px] ${props.fullWidth && "w-full"} `}>
                <CardBody className="flex flex-row gap-4">
                    <div>
                        <Image height={100} width={100} src={props.character.image_link} alt={props.character.name} />
                    </div>
                    <div className="flex flex-col justify-between">
                        <div className="flex flex-col">
                            <div className="flex flex-col">
                                <div className="flex flex-col">
                                    <h3 className="font-bold">{props.character.name}</h3>
                                    
                                </div>
                            </div>
                            <p className=" text-sm dark:text-slate-400">{props.character.description}</p>
                        </div>
                        <div className="flex flex-row items-center gap-2 text-xs dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <Icon downscale filled>chat_bubble</Icon>
                                30.0m
                            </span>
                            <span className="flex items-center gap-1">
                                <Icon downscale filled>account_circle</Icon>
                                {props.character.owner.username}
                            </span>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </ConditionalLink>
        </>
    )
}