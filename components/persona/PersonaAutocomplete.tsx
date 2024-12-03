"use client";


import React from "react";
import {Autocomplete, AutocompleteItem} from "@nextui-org/autocomplete";
import { useAsyncList } from "@react-stately/data";

import { Persona } from "@/types/db";
import { searchPersonas } from "@/functions/db/personas";
import PersonaCard from "./PersonaCard";

type Props = {
    setPersona?: (persona: Persona | undefined) => void;
    defaultPersona?: Persona;
}

export default function PersonaAutocomplete(props: Props) {

    const list = useAsyncList<Persona>({
        initialSelectedKeys: props.defaultPersona ? [props.defaultPersona.id] : [],
        initialFilterText: props.defaultPersona ? props.defaultPersona.full_name : "",
        async load({filterText}) {
            const res = await searchPersonas(filterText || "");

            // sort so is_private comes first
            res.sort((a, b) => a.is_private === b.is_private ? 0 : a.is_private ? -1 : 1);

            return {
                items: res
            }
        }
    })


    return (
        <Autocomplete 
            label="Change Persona"
            placeholder="Search for a Persona"
            name="persona"
            isLoading={list.isLoading}
            items={list.items}
            inputValue={list.filterText}
            defaultInputValue={props.defaultPersona?.full_name ?? "default"}
            onInputChange={list.setFilterText}
            onSelectionChange={(key: React.Key | null) => {
                if(props.setPersona) {
                    if(!key) { props.setPersona(undefined); }
                    props.setPersona(list.items.find((item) => item.id === key) as Persona);
                }
            }}
        >
            {(item) => (
                <AutocompleteItem key={item.id} textValue={item.full_name}>
                    <PersonaCard data={item} hasLink={false} fullWidth isSmall noBg />
                </AutocompleteItem>
            )}
        </Autocomplete>
    )
}