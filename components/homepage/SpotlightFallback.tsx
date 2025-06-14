import { Card, CardContent, CardDescription, CardTitle, CardHeader } from "../ui/card";

export default function SpotlighFallback() {
    return (
        <>
        <div className="w-full h-[320px] relative overflow-visible">
            <Card 
                className={`
                    dark:bg-zinc-600/10 relative overflow-hidden rounded-3xl h-full
                `}
            >
                <CardHeader>
                    <CardDescription className="font-medium text-md">Check out this Character</CardDescription>
                    <CardTitle className="text-4xl font-bold">Spotlight</CardTitle>
                </CardHeader>
                <CardContent>
                    
                </CardContent>
            </Card>
        
        </div>
        </>
    )
}