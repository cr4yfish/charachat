

export default function Layout({ children } : { children: React.ReactNode | React.ReactNode[]}) {

    return (
        <div className="overflow-y-auto max-h-screen pb-20"> 
            {children}
        </div>
    )
}  