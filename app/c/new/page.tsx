"use server";

import { Input, Textarea } from "@nextui-org/input";
import { Button } from "@/components/utils/Button";
import { saveCharacter } from "./actions";

export default async function NewCharacter() {

    return (
        <>
        <h2 className="font-bold text-lg">Create a new Character</h2>
        <form className="flex flex-col gap-4">
            <Input name="name" isRequired label="Character Name" />
            <Input name="description" isRequired label="Character Description" />
            <Textarea name="bio" isRequired label="Character Bio" />
            <Textarea name="intro" label="Character Intro" />
            <Textarea name="book" label="Character Book" />
            <Button formAction={saveCharacter} type="submit" >Save</Button>
        </form>
        </>
    )
}