
export default function Layout({ children } : { children: React.ReactNode | React.ReactNode[]}) {

    return (
        <>
            
        <div className="h-fit flex flex-col gap-2 pb-20 px-4 py-6">
            {children}
        </div>
           
        </>
    )
}