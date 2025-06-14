"use client";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Tag } from "@/types/db";
import { Button } from "./utils/Button";
import { useEffect, useState } from "react";
import { getTags } from "@/functions/db/tags";

type Props = {
    selectedTags: Tag[]
    onSelect: (tags: Tag[]) => void
}

export default function TagsSelect(props: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const [availableTags, setAvailableTags] = useState<Tag[]>([])

    useEffect(() => {
        const fetchTags = async () => {
            setIsLoading(true);
            const tags = await getTags();
            setAvailableTags(tags);
            setIsLoading(false);
        }
        if(availableTags.length === 0) {
            fetchTags();
        }
    }, [])

    const handleUpdateValue = (tag: Tag) => {
        if(!props.selectedTags || props.selectedTags.length === 0) {
            props.onSelect([tag])
            return;
        }

        if(props.selectedTags.find(t => t.id === tag.id)) {
            props.onSelect(props.selectedTags.filter(t => t.id !== tag.id))
            return;
        } else {
            props.onSelect([...props.selectedTags, tag])
            return;
        }
    }

    return (
        <>
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="flat" color="secondary">
                    Select Tags
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Select Tags</DrawerTitle>
                    <DrawerDescription>Tag tags to add them</DrawerDescription>
                </DrawerHeader>

                <div className="p-4 flex flex-row flex-wrap gap-3">
                    {isLoading && <Spinner />}
                    {availableTags.map(tag => (
                        <Chip 
                            key={tag?.id} 
                            variant={props.selectedTags?.find(t => t?.id === tag?.id) ? "solid" : "bordered"}
                            onClick={() =>  handleUpdateValue(tag)} 
                            size="lg" 
                        >
                            {tag.name}
                        </Chip>    
                    ))}
                </div>

                <DrawerFooter>
                    <DrawerClose>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>

        </>
    )
}