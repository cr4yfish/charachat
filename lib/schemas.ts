import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

export const signUpSchema = z.object({
    username: z.string()
        .min(5, { message: "Username must be at least 5 characters long" })
        .max(50, { message: "Username must be at most 50 characters long" }),
    firstName: z.string()
        .min(2, { message: "First Name must be at least 2 characters long" })
        .max(50, { message: "First Name must be at most 50 characters long" }),
    avatarLink: z.string()
        .optional(),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

export const storySchema = z.object({
    title: z.string()
        .min(5, { message: "Title must be at least 5 characters long" })
        .max(100, { message: "Title must be at most 100 characters long" }),
    description: z.string()
        .min(10, { message: "Description must be at least 10 characters long" })
        .max(350, { message: "Description must be at most 350 characters long" }),
    story: z.string()
        .min(100, { message: "Story must be at least 100 characters long" })
        .max(2000, { message: "Story must be at most 2000 characters long" }),
    first_message: z.string()
        .min(20, { message: "First Message must be at least 20 characters long" })
        .max(500, { message: "First Message must be at most 500 characters long" }),
    image_link: z.string()
        .min(5, { message: "Image Link must be at least 5 characters long" })
        .url({ message: "Invalid URL" }),
})

export const personaSchema = z.object({
    fullName: z.string()
        .min(5, { message: "Name must be at least 5 characters long" })
        .max(100, { message: "Name must be at most 50 characters long" }),
    bio: z.string()
        .max(2000, { message: "Description must be at most 350 characters long" }),
    avatarLink: z.string()
        .min(5, { message: "Image Link must be at least 5 characters long" })
        .url({ message: "Invalid URL" }),
})