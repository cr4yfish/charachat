"use client";

import { useRouter } from "next/navigation";

import { Button } from "./Button";
import Icon from "./Icon";


export default function BackLink() {
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