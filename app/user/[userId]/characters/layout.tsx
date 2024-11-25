
import { Metadata } from "next";


export const metadata : Metadata = {
    title: "Your Characters",
}
export default function Layout({ children } : { children: React.ReactNode | React.ReactNode[]}) {

    return (
        <>
            
        {children}
           
        </>
    )
}