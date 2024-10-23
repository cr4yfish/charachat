import React from "react";

export default function Layout({children} : {children: React.ReactNode | React.ReactNode[]}) {
    return (
        <div className="h-full min-h-full dark px-4 py-6 flex flex-col justify-between">
            {children}
        </div>
    )


}