import { Importer } from "@/components/character/import/importer";
import { searchJanitor } from "../actions";

export default async function ImportPage() {
    
    return (
        <div className="h-full">
            <Importer 
                searchAction={searchJanitor} 
                label="Import JanitorAI"
            />   
        </div>
    )
}