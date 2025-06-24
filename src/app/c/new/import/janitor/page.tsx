import { Importer } from "@/components/new-character/import/importer";
import { searchJanitor } from "../../actions";

export default async function ImportPage() {
    
    return (
        <div className="h-full w-full">
            <Importer 
                searchAction={searchJanitor} 
                label="Import JanitorAI"
            />   
        </div>
    )
}