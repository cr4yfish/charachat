
export default function Layout({ children } : { children: React.ReactNode | React.ReactNode[]}) {

    return (
        <>
        <div className="flex flex-col h-full w-full overflow-y-auto ">
            
            <div className="h-full">
                {children}
            </div>
           
        </div>
        </>
    )
}