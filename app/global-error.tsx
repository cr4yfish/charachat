'use client' // Error boundaries must be Client Components
 
type ErrorProps = {
    error: Error & { digest?: string },
    reset: () => void,
}

export default function GlobalError(props: ErrorProps) {
  console.error(props.error);
  return (
    // global-error must include html and body tags
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => props.reset()}>Try again</button>
      </body>
    </html>
  )
}