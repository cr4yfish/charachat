import React from "react";

export default function Layout({children} : {children: React.ReactNode | React.ReactNode[]}) {
    return (
        <div className="flex flex-col justify-between overflow-hidden">
            {children}
        </div>
    )


}