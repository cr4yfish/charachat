import { fal } from "@fal-ai/client";

type RequestBody = {
    imageLink: string;
    prompt: string;
}

export async function POST(req: Request) {
    const { imageLink, prompt } = await req.json() as RequestBody;

    const result = await fal.subscribe("fal-ai/ltx-video/image-to-video", {
        input: {
            prompt: prompt,
            image_url: imageLink
        },
        logs: true,
        onQueueUpdate: (update) => {
            if(update.status === "IN_PROGRESS") {
                update.logs.map((log) => log.message).forEach(console.log);
            }
        }
    })

    try {
        return new Response(JSON.stringify({ link: result.data.video.url }), { status: 200 });
        
    } catch (e) {
        const err = e as Error;
        return new Response(err.message, { status: 500 });
    }
}