"use client";

import { Avatar } from "@nextui-org/avatar";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Persona, Profile } from "@/types/db";
import Icon from "@/components/utils/Icon";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../utils/Button";

type Props = {
    persona: Persona,
    profile?: Profile
}

export default function PersonaPage(props: Props) {

    return (
        <>
        <div className="flex flex-col items-center gap-4 pb-20 px-6 py-6 relative h-full overflow-x-hidden">

            <div className=" -z-10 absolute top-0 left-0 w-full h-full blur-3xl opacity-75 overflow-hidden">
                <Image src={props.persona.avatar_link ?? ""} layout="fill" className="object-cover" alt="" />
            </div>

            <div className="flex flex-row max-md:flex-col gap-6 items-center justify-center w-full">

                <div className="flex flex-col justify-center gap-4 max-md:w-full">
                    <div className="flex flex-col gap-2 items-center justify-center">
                        <Avatar src={props.persona.avatar_link} className="w-32 h-32 text-large"/>
                        <h1 className="text-xl font-bold">{props.persona.full_name}</h1>
                        <p className="text-sm dark:text-neutral-400">By @{props.persona.creator.username}</p>
                    </div>


                    <div className="w-full flex items-center justify-center gap-2">
                        {props.profile?.user == props.persona.creator.user &&
                            <Link href={`/persona/${props.persona.id}/edit`}>
                                <Button
                                    color="warning"
                                    size="lg" variant="flat" radius="full"                        
                                >
                                    Edit
                                </Button>
                            </Link>
                        }
                    </div>


                    {props.persona.is_private && 
                        <div className="flex flex-col gap-1 border border-green-500 rounded-lg p-2">
                            <div className="flex items-center gap-1 text-green-500">
                                <Icon downscale filled color="green-500">lock</Icon>
                                <span className="text-sm">Private</span>
                            </div>
                            <span className="text-xs dark:text-zinc-400">This Character is only accessible by you and otherwise encrypted.</span>
                        </div>
                    }

                </div>




                <div className="flex flex-col max-md:w-full">
                    <Tabs variant="underlined"
                        classNames={{
                            cursor: "dark:bg-zinc-400",
                        }}
                    >
                        <Tab key="about" title="About">
                            <div className="w-full flex justify-start items-start flex-col prose dark:prose-invert prose-p:text-sm dark:prose-p:text-zinc-400 prose-h3:mt-0">
                                <h2>About</h2>
                                <h3>Bio</h3>
                                <p>{props.persona.bio}</p>
                            </div>
                        </Tab>
                        <Tab key="characters" title="Characters">
                            <div>
                                <h2>TBD</h2>
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>
                        


        </div>
        </>
    )

}