"use client";

import { Button } from "@/components/utils/Button";
import Link from "next/link";
import { useEffect } from "react";


type ErrorProps = {
    error: Error & { digest?: string },
    reset: () => void,
}

export default function Error(props: ErrorProps) {

    useEffect(() => {
        console.error(props.error);
    }, [props.error])

    return (
        <>
      <div className="prose dark:prose-invert p-10">
        <h1>Uh, oh. Something went wrong</h1>
        <p>And I don&apos;t know what. Try refreshing the page or Logout and back in. Also please report this issue.</p>
        <Button onClick={props.reset} color="danger">Refresh</Button>
        <div className="flex flex-col gap-1a">
          <Link href={"https://github.com/cr4yfish/charachat/issues/new"} className="dark:text-blue-500">Report this on GitHub</Link>
          <span>or</span>
          <Link href={"https://www.reddit.com/r/Charachat/"} className="dark:text-blue-500">Report this on Reddit</Link>
        </div>
        
        <h3>This is the error message:</h3>
        <pre>{props.error.message}</pre>
      </div>
      </>
    )
}