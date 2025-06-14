
type Props = {
    size?: "sm" | "md" | "lg";
    color?: "primary" | "secondary" | "default";
    className?: string;
}

export function Spinner(props: Props) {

    return (
        <svg
            className={`animate-spin h-5 w-5 text-gray-500 ${props.className}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2.93 6.343A8.003 8.003 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3.93-1.595zM20.938 21c1.865-2.114 3-4.896 3-7.938h-4a8.003 8.003 0 01-2.93 6.343l3.93 1.595zM12 20a8 8 0 008-8h-4a4 4 0 01-4 4v4zM12V8a4 4 0 014-4V0a8 8 0 00-8 8h4z"
            ></path>
        </svg>
    )
}