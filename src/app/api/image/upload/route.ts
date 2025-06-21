
import { uploadImageToImgur } from "@/lib/imgur";

export async function POST(req: Request) {
    const formData = await req.formData() as FormData;

    const image = formData.get("image") as File;

    // Convert image to base64
    const base64 =  (await image.arrayBuffer().then((buffer) => Buffer.from(buffer).toString("base64")));

    // Upload image to imgur
    const link = await uploadImageToImgur(base64);

    try {
        return new Response(JSON.stringify({ link: link }), { status: 200 });
        
    } catch (e) {
        const err = e as Error;
        return new Response(err.message, { status: 500 });
    }
}