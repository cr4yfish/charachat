import { deleteCharacter } from "@/lib/db/character";

export async function DELETE(request: Request) {
    const { id } = await request.json();

    if (!id) {
        return Response.json({ error: "Character ID is required" }, { status: 400 });
    }

    try {
        // Assuming deleteCharacter is a function that deletes a character by ID
        await deleteCharacter(id);

        return Response.json({ message: "Character deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting character:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}