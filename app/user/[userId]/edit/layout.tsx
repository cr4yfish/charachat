
import { Metadata } from "next";


export const metadata : Metadata = {
    title: "Edit your Profile",
}
export default function Layout({ children } : { children: React.ReactNode | React.ReactNode[]}) {

    return (
        <>
            
        {children}
           
        </>
    )
}