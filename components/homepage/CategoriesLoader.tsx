"use server";

import { getCategories } from "@/functions/db/categories";
import CategoryScroller from "../CategoryScroller";
import { LoadMoreProps } from "@/types/client";


export default async function CategoriesLoader() {

    const defaultLoad: LoadMoreProps = {
        cursor: 0,
        limit: 15,
    }

    const categories = await getCategories(defaultLoad);

    return (
        <>

        <CategoryScroller categories={categories} />
        </>
    )
}