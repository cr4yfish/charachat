import { Importer } from "@/components/new-character/import/importer";
import { searchAnime } from "../actions";

export default async function ImportPage() {
    
    return (
        <div className="h-full">
            <Importer 
                searchAction={searchAnime} 
                label="Import Wikipedia"
            />   
        </div>
    )
}