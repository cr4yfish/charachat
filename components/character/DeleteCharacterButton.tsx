"use client";

import { deleteCharacter } from "@/functions/db/character";
import { useState } from "react";
import { Button } from "../utils/Button";
import Icon from "../utils/Icon";
import { useToast } from "@/hooks/use-toast";


type Props = {
    characterId: string;
}

export default function DeleteCharacterButton(props: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            await deleteCharacter(props.characterId);
            setIsDone(true);
            window.location.href = "/";   
        } catch (error) {
            console.error(error);
            setIsLoading(false);
            toast({
                title: "Error",
                description: "Could not delete Character",
                variant: "destructive"
            });
        }
    }

    return (
        <>
        <Button
            isLoading={isLoading}
            isDisabled={isDone}
            onClick={handleDelete}
            color="danger"
            size="lg"
            fullWidth
            variant="flat"
            startContent={<Icon filled>delete</Icon>}
        >
            {isLoading ? "Deleting" : isDone ? "Redirecting" : "Delete Character"}
        </Button>
        </>
    )
}