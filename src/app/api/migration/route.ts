import { generateKeyLegacy } from "@/lib/crypto/client/legacy";
import { TIMINGS } from "@/lib/constants/timings";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";


export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const cookieStore = await cookies();

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new Response(JSON.stringify({ success: false, error: "User not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: "Email and password are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }


    /**
     * Migrate from charachat v1 to charachat v2
     * 
     * Strategy:
     * 1. Validate the email and password against the Charachat v1 database.
     * 
     * 2. Run the legacy Supabase Authentication to get RLS access <- Maybe use the service role key instead?
     * 3. Go over each table and add the users' new clerk_user_id
     * 4. Log out the user from the legacy system
     */
    
    // Step 1: Validate the email and password against the Charachat v1 database
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string);

    const { data: supabaseUser, error: supabaseAuthError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (supabaseAuthError || !supabaseUser) {
      return new Response(JSON.stringify({ success: false, error: "Invalid Charachat v1 email or password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // step 1.5: generate a decryption key for handling old encrypted messages
    const legacyKeyBuffer = generateKeyLegacy(password, email);
    cookieStore.set(
        "key", 
        legacyKeyBuffer.toString("hex"), 
        { secure: true, sameSite: "strict", priority: "high", maxAge: TIMINGS.ONE_YEAR}
    );

    // Step 2: Migrate user data

    // Profile -> add clerk_user_id
    const { error: profileError } = await supabaseAdmin.from("profiles")
      .update({ clerk_user_id: clerkUser.id })
      .eq("user", supabaseUser.user.id)
      .select("*")
      .single();
      
    if (profileError) {
      return new Response(JSON.stringify({ success: false, error: "Profile migration failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Chats -> add clerk_user_id
    const { error: chatsError } = await supabaseAdmin.from("chats") 
      .update({ clerk_user_id: clerkUser.id })
      .eq("user", supabaseUser.user.id);
    
    if (chatsError) {
      return new Response(JSON.stringify({ success: false, error: "Chats migration failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Messages -> add clerk_user_id
    const { error: messagesError } = await supabaseAdmin.from("messages")
      .update({ clerk_user_id: clerkUser.id })
      .eq("user", supabaseUser.user.id);
    
    if (messagesError) {
      return new Response(JSON.stringify({ success: false, error: "Messages migration failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // characters -> add clerk_user_id
    const { error: charactersError } = await supabaseAdmin.from("characters")
      .update({ owner_clerk_user_id: clerkUser.id })
      .eq("owner", supabaseUser.user.id);
    if (charactersError) {
      return new Response(JSON.stringify({ success: false, error: "Characters migration failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // personas -> add clerk_user_id
    const { error: personasError } = await supabaseAdmin.from("personas")
      .update({ clerk_user_id: clerkUser.id })
      .eq("creator", supabaseUser.user.id);
      
    if (personasError) {
      return new Response(JSON.stringify({ success: false, error: "Personas migration failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // stories -> add clerk_user_id
    const { error: storiesError } = await supabaseAdmin.from("stories")
      .update({ clerk_user_id: clerkUser.id })
      .eq("creator", supabaseUser.user.id);
    if (storiesError) {
      return new Response(JSON.stringify({ success: false, error: "Stories migration failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Migration failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}