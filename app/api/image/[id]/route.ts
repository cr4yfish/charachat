import { uploadLinkToImgur } from "@/functions/ai/image";
import { getCurrentUser } from "@/functions/db/auth";
import { getKeyServerSide } from "@/functions/serverHelpers";
import { decryptMessage } from "@/lib/crypto";
import { NextResponse } from "next/server";
import Replicate from "replicate";
 


type Params = Promise<{ id: string}>

 
export async function GET(request: Request,  { params } : { params: Params }) {
    // get the replicateToken from the request headers
    const user = await getCurrentUser();
    const encryptedToken = user.replicate_encrypted_api_key;
    if (!encryptedToken) {
        return NextResponse.json({ detail: "No Replicate API key found" }, { status: 400 });
    }

    const key = await getKeyServerSide();
    const keyBuffer = Buffer.from(key, "hex");
    const replicateToken = decryptMessage(encryptedToken, keyBuffer);

    const replicate = new Replicate({
        auth: replicateToken,
    });

    const { id } = await params;
    const prediction = await replicate.predictions.get(id);
    
    if (prediction?.error) {
        return NextResponse.json({ detail: prediction.error }, { status: 500 });
    }
    
    return NextResponse.json(prediction);
}