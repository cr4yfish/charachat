import { NextResponse } from "next/server";
import Replicate from "replicate";
 


type Params = Promise<{ id: string}>

 
export async function GET(request: Request,  { params } : { params: Params }) {
    // get the replicateToken from the request headers
    const replicateToken = request.headers.get('Authorization');

    if (!replicateToken) {
        return NextResponse.json({ detail: 'Authorization header is required' }, { status: 401 });
    }

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