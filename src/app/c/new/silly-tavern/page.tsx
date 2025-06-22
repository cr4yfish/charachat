import { Importer } from "@/components/new-character/import/importer";
import { searchSillyTavern } from "../actions";

export default async function ImportPage() {
    
    return (
        <div className="h-full">
            <Importer 
                searchAction={searchSillyTavern} 
                label="Import SillyTavern"
            />   
        </div>
    )
}