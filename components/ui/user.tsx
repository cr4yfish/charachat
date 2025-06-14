
import { Avatar, AvatarImage, AvatarFallback } from "./avatar"

type Props = {
    name?: string;
    description?: string;
    avatarProps: {
        src?: string;
        alt?: string;
        size?: "sm" | "md" | "lg";
        fallback?: string;
    }
}

export function User(props: Props): React.ReactNode {
    return (
        <div>
            <Avatar>
                <AvatarImage src={props.avatarProps?.src} />
                {props.avatarProps.fallback && <AvatarFallback>{props.avatarProps?.fallback}</AvatarFallback>}
            </Avatar>
        </div>
    )
}