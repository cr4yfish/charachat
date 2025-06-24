import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


export default function ComparisonTable() {
    return (
        <div className="pt-2 border-t">
            <h3 className="font-semibold text-sm mb-3">How Charachat Compares</h3>
            <div className="overflow-x-auto">
                <Table className="text-xs min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px] text-xs">Feature</TableHead>
                            <TableHead className="text-xs text-green-600 min-w-[80px]">Charachat</TableHead>
                            <TableHead className="text-xs text-muted-foreground min-w-[80px]">Character.AI</TableHead>
                            <TableHead className="text-xs text-muted-foreground min-w-[80px]">JanitorAI</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">Encryption</TableCell>
                            <TableCell className="text-green-600">✓ AES-256</TableCell>
                            <TableCell className="text-red-500">✗ None</TableCell>
                            <TableCell className="text-red-500">✗ None</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Open Source</TableCell>
                            <TableCell className="text-green-600">✓ Free & Open</TableCell>
                            <TableCell className="text-red-500">✗ Closed</TableCell>
                            <TableCell className="text-red-500">✗ Closed</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">AI Choice</TableCell>
                            <TableCell className="text-green-600">✓ 10+ Providers</TableCell>
                            <TableCell className="text-red-500">✗ Locked In</TableCell>
                            <TableCell className="text-red-500">✗ Limited</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Private Chars</TableCell>
                            <TableCell className="text-green-600">✓ Encrypted</TableCell>
                            <TableCell className="text-red-500">✗ Public</TableCell>
                            <TableCell className="text-red-500">✗ Public</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Content</TableCell>
                            <TableCell className="text-green-600">✓ User Choice</TableCell>
                            <TableCell className="text-red-500">✗ Censored</TableCell>
                            <TableCell className="text-yellow-500">~ NSFW Only</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Team</TableCell>
                            <TableCell className="text-green-600">✓ Solo Dev</TableCell>
                            <TableCell className="text-gray-500">Corp Team</TableCell>
                            <TableCell className="text-gray-500">Corp Team</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}