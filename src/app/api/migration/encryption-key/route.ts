/**
 * Re-generate the legacy encryption key for old encrypted data.
 */

import { TIMINGS } from "@/lib/constants/timings";
import { generateKeyLegacy } from "@/lib/crypto/client/legacy";
import { cookies } from "next/headers";


export async function POST(request: Request) {
    const  { email, password } = await request.json();

    if(!email || !password) {
        return new Response("Email and password are required", { status: 400 });
    }

    console.log("Generating legacy encryption key for email:", { email, password });

    try {
        const key = generateKeyLegacy(password, email); 
        console.log("Generated key:", key.toString("hex"));

        if(!key) {
            return new Response("Failed to generate key", { status: 500 });
        }

            // Set the key in cookies
            const cookiesStore = await cookies();
            cookiesStore.set("key", key.toString("hex"), {
                secure: true,
                sameSite: "strict",
                httpOnly: true,
                priority: "high",
                maxAge: TIMINGS.THIRTY_DAYS, // 30 days
            });

            return new Response("Key generated successfully", { status: 200 });

    } catch (error) {
        return new Response("Failed to generate key: " + error, { status: 500 });
    }
    

}