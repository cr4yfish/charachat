


export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center h-full max-h-screen w-full relative overflow-hidden">
            {children}
        </div>
    );
}