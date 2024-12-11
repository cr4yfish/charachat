
import { Metadata } from "next";


export const metadata : Metadata = {
    title: "Your Stories",
}
export default function Layout({ children } : { children: React.ReactNode | React.ReactNode[]}) {

    return (
        <>
            
        {children}
           
        </>
    )
}