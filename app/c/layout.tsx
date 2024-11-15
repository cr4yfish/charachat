import { Button } from "@/components/utils/Button";
import Icon from "@/components/utils/Icon";
import Link from "next/link";


export default function Layout({ children } : { children: React.ReactNode | React.ReactNode[]}) {

    return (
        <>
        <div className="flex flex-col h-screen px-4 py-6">
            <Link href="/"><Button variant="light" isIconOnly><Icon filled>arrow_back</Icon></Button></Link>
            <div className="h-fit flex flex-col gap-2">
                {children}
            </div>
           
        </div>
        </>
    )
}