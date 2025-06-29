import { Importer } from "@/components/new-character/import/importer";
import { searchFandom } from "../../actions";

/**
 * Fandom import page
 */
export default async function ImportPage() {
    
    return (
        <div className="h-full w-full">
            <Importer 
                searchAction={searchFandom} // should be "searchFandom"
                label="Import Fandom"
            />   
        </div>
    )
}