import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

type Props = {
    description?: string;
    title?: string;
    href: string;
}

/**
 * 
 * @param param0 
 * @returns 
 */
export default function PersonalizedCarouselActionCard(props: Props) {
    return (
        <Link href={props.href} className="w-full">
            <div className="flex flex-row justify-between items-center gap-2 rounded-3xl text-fuchsia-200/80 bg-fuchsia-800 p-4 cursor-pointer hover:bg-fuchsia-700 transition-all duration-200">
                <div className="flex flex-col gap-1">
                    <p className="text-xs">{props.description}</p>
                    <div className="flex items-center gap-1">
                        <h2 className="font-bold text-white/90">{props.title}</h2>
                    </div>
                    
                </div>
                <div className="flex items-center self-end ">
                    <ArrowRightIcon color="currentColor" className="self-end" />
                </div>
            </div>
        </Link>
    );
}