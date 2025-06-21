
export default function MigratePage() {

    return (
        <div className="flex flex-col gap-4 h-full w-full px-4 pt-[75px] pb-[100px] overflow-y-auto">
            <div className="flex flex-col gap-2 text-muted-foreground">
                <h1 className="text-2xl font-bold text-white">Migration from Charachat v1</h1>
                <p>If you were a Charachat user, you can migrate your settings and chats to the new system. This will allow you to continue using your previous data seamlessly.</p>
                <p>Please note that this migration is one-way and cannot be undone.</p>
                <p>Click the button below to start the migration process.</p>
            </div>

        </div>
    );
}