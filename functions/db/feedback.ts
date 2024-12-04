/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/utils/supabase/supabase";

const tableName = "anon-feedback";

type SendFeedbackProps = {
    feedback: string;
    source: string;
}

export async function sendFeedback(props: SendFeedbackProps) {
    const { error } = await (await createClient())
        .from(tableName)
        .insert({
            content: props.feedback,
            source: props.source,
        });

    if(error) {
        console.error(error);
        return false;
    }

    return true;
}