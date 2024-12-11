
import { Metadata } from "next";


export const metadata : Metadata = {
    title: "Your Chats",
}
export default function Layout({ children } : { children: React.ReactNode | React.ReactNode[]}) {

    return (
        <>
            
        {children}
           
        </>
    )
}