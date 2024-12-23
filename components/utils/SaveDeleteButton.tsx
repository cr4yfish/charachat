"use client";

import { useState } from "react";
import { Button } from "./Button";
import Icon from "./Icon";


type Props = {
    onDelete: () => void;
    isLoading?: boolean;
    isDisabled?: boolean;
    label?: string;
}

export default function SaveDeleteButton(props: Props) {
    const [isSure, setIsSure] = useState(false);

    return (
        <>
            <Button
                onClick={() => {
                    if(isSure) {
                        props.onDelete();
                    } else {
                        setIsSure(true);
                    }
                }}
                isLoading={props.isLoading}
                isDisabled={props.isDisabled}
                color="danger"
                fullWidth
                startContent={<Icon filled>delete</Icon>}
                size="lg"
            >
                {isSure ? "Are you sure?" : (props.label ? props.label : "Delete")}
            </Button>
        </>
    )

}