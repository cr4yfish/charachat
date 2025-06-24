"use client";

import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { memo, useRef, useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import Image from "next/image";
import { CloudUploadIcon, SparkleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { safeParseLink } from "@/lib/utils/text";
import { toast } from "sonner";

type Props = {
    label?: string;
    description?: string;
    optional?: boolean;
    link?: string;
    onImageUpload?: (url: string) => void; // Callback for when an image is uploaded
}


/**
 * Image input component that allows users to upload images.
 * It supports optional labels, descriptions, and links.
 * Supports drag-and-drop functionality for image uploads.
 * 
 * Uploads images to Imgur and returns the image URL.
 * 
 * @param props 
 * @returns 
 */
const PureImageInput = (props: Props) => {
    const [isDragging, setIsDragging] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(props.link || null);
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        const formData = new FormData();
        formData.append("image", file);
        setIsUploading(true);
        try {
            const response = await fetch(API_ROUTES.UPLOAD_IMAGE, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Image upload failed");
            }

            const data = await response.json();
            setImageUrl(data.link); // Store the image URL in state
            toast.success("Image uploaded successfully!");
            if (props.onImageUpload) {
                props.onImageUpload(data.link); // Call the callback with the image URL
            }
            return data.link; // Return the image URL
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Image upload failed. Please try again.");
            throw error; // Re-throw the error for handling in the parent component
        } finally {
            setIsUploading(false);
        }
    }

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        if(isUploading) return; // Prevent drop if already uploading

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            handleUpload(file)
                .catch((error) => {
                    console.error("Error uploading image:", error);
                });
        }
    }
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
        event.dataTransfer.dropEffect = "copy"; // Show copy cursor
    }

    const handleDragLeave = () => {
        setIsDragging(false);
    }

    return (
        <div className={cn("flex flex-col gap-1 border-2 border-dashed border-transparent  transition-colors p-1 rounded-lg", { "border-blue-500": isDragging })}
        
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex flex-col">
                {props.label && <label className="text-sm font-medium">{props.label}</label>}
                {props.description && <p className="text-xs text-muted-foreground">{props.description}</p>}
            </div>


            <div 
                className={cn("flex flex-row gap-2 items-center")}
       
            >
                <div 
                    className={`relative size-10 overflow-hidden rounded-full p-4 border-2 `}
         
                >
                    {imageUrl && <Image 
                        src={imageUrl} // Placeholder image if no image is uploaded
                        alt=""
                        fill
                    />}
                </div>

                <Input 
                    value={imageUrl || ""}
                    onChange={(e) => {
                        const link = safeParseLink(e.currentTarget.value);
                        setImageUrl(link)
                        if (props.onImageUpload) {
                            props.onImageUpload(link); // Call the callback with the new URL
                        }
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="border-border"
                />
            </div>

            <div className="flex flex-row items-center gap-2">
                <Button
                    onClick={() => inputRef.current?.click()}
                    disabled={isUploading}
                    className="grow w-fit"
                    variant={"ghost"}
                >
                    <CloudUploadIcon />
                    {isUploading ? "Uploading..." : "Upload Image"}
                </Button>
                <Button disabled={true} className="w-fit" variant={"ghost"} >
                    <SparkleIcon />
                    Generate
                </Button>

            </div>


            <input 
                type="file" 
                accept="image/*" 
                hidden
                ref={inputRef}
                className="border border-neutral-300 rounded p-2"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        handleUpload(file)
                            .catch((error) => {
                                console.error("Error uploading image:", error);
                            });
                    }
                }}
         />
        </div>
    )
}

export const ImageInput = memo(PureImageInput, (prevProps, nextProps) => {
    if(prevProps.label !== nextProps.label ||
       prevProps.description !== nextProps.description ||
       prevProps.optional !== nextProps.optional ||
       prevProps.link !== nextProps.link) {
        return false; // Re-render if any prop has changed
    }

    return true;
});