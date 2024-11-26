"use client";


import React from "react";
import {Autocomplete, AutocompleteItem} from "@nextui-org/autocomplete";
import { useAsyncList } from "@react-stately/data";

import { Persona } from "@/types/db";
import { searchPersonas } from "@/functions/db/personas";

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

            return {
                items: res
            }
        }
    })


    return (
        <Autocomplete 
            label="Pick a Persona"
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
                <AutocompleteItem key={item.id} className="capitalize">
                    {item.full_name}
                </AutocompleteItem>
            )}
        </Autocomplete>
    )
}