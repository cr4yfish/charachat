"use client";

import { useRouter } from "next/navigation";

import { Button } from "./Button";
import Icon from "./Icon";

type Props = {

}

export default function BackLink(props: Props) {
    const router = useRouter();

    return (
        <>
        <Button 
            onClick={() => router.back()}
            variant="light" 
            isIconOnly
        >
            <Icon>arrow_back</Icon>
        </Button>
        </>
    )
}