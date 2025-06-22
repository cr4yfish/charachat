

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ redirect?: string | undefined }>}) {
    const { redirect="/" } = await searchParams;

    return (
        <div>
            todo

            <span>Redirect to: {redirect} after login</span>
        </div>
    )
}