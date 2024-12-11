"use server";

import { redirect } from "next/navigation";

export default async function EditUserPage() {
    redirect("/user/edit");
}