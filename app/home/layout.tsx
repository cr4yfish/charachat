"use server";

export default async function Layout({ children } : { children: React.ReactNode | React.ReactNode[]}) {
    
    return (
        <>
        <div className="py-6 pb-20 px-4 flex flex-col gap-4 h-full overflow-y-auto">
            {children}
        </div>
        
        </>
    )
}