import { Importer } from "@/components/character/import/importer";
import { searchAnime } from "../actions";

export default async function ImportPage() {
    
    return (
        <div className="h-full">
            <Importer 
                searchAction={searchAnime} 
                label="Import Fandom"
            />   
        </div>
    )
}