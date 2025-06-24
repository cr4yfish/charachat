import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button";
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

type NewCardProps = {
  title: string;
  description: React.ReactNode;
}

const NewsCard = (props: NewCardProps) => {
  return (
    <CarouselItem className="min-lg:basis-1/3 min-sm:max-lg:basis-1/2  min-h-[100px]">
      <Alert className="rounded-3xl dark:prose-invert prose-p:m-0 flex flex-col gap-1 justify-start">
        <AlertTitle className="m-0 select-none" >{props.title}</AlertTitle>
        <AlertDescription className="text-xs select-none">
          {props.description}
        </AlertDescription>
      </Alert>
    </CarouselItem>
  )
}

export default function News() {


    return (
        <>
        <Carousel>
          <CarouselContent>             
            <NewsCard 
              title="🔒 Strongly Encrypted"
              description={
                <>
                  <p>Your conversations are protected with AES-256-GCM encryption at rest and in transit.</p>
                </>
              }
            />

            <NewsCard 
              title="⭐ Open Source Freedom"
              description={
                <>
                  <p>Fully transparent code. Choose your AI provider. Your data, your control.</p>
                </>
              }
            />

            <NewsCard 
              title="🛡️ Privacy First"
              description={
                <>
                  <p>Your data stays secure and private. No selling, no tracking, no unwanted analysis.</p>
                </>
              }
            />

            <NewsCard 
              title="🚀 Join our community!"
              description={
                <>
                  <div className="flex flex-row flex-wrap items-center gap-2">
                    <Link target="_blank" href={"https://www.reddit.com/r/Charachat"}>
                      <Button variant={"link"} className="text-red-400" >Reddit</Button>
                    </Link>
                    <Link target="_blank" href={"https://discord.gg/2HqqwcwGCy"}>
                      <Button variant={"link"} className="text-blue-500">Discord</Button>
                    </Link>
                  </div>
                </>
              }
            />

          </CarouselContent>
        </Carousel>
        </>
    )
}