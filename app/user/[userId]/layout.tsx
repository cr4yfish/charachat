

export default function Layout({ children } : { children: React.ReactNode | React.ReactNode[]}) {

    return (
        <div className="max-h-screen relative h-full"> 
            {children}
        </div>
    )
}  