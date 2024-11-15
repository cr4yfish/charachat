
export default function Layout({ children } : { children: React.ReactNode | React.ReactNode[]}) {

    return (
        <>
        <div className="flex flex-col h-screen px-4 py-6">
            
            <div className="h-fit flex flex-col gap-2 pb-20">
                {children}
            </div>
           
        </div>
        </>
    )
}