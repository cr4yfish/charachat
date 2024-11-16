import React from "react";

export default function Layout({children} : {children: React.ReactNode | React.ReactNode[]}) {
    return (
        <div className="flex flex-col justify-between overflow-hidden overflow-y-hidden h-full max-h-screen">
            {children}
        </div>
    )


}