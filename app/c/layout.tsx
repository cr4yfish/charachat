
export default function Layout({ children } : { children: React.ReactNode | React.ReactNode[]}) {

    return (
        <>
        <div className="flex flex-col h-fit w-full ">
            
            <div className="h-full flex flex-col gap-2 pb-20">
                {children}
            </div>
           
        </div>
        </>
    )
}