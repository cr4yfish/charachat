"use server";

import React from "react";

export default async function Layout({ children }: { children: React.ReactNode | React.ReactNode[] }) {
    
    return (
        <>
        <div className="flex flex-col pt-10 pb-20 px-4 h-full">
            {children}
        </div>
        </>
    )
}