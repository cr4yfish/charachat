import { memo, useCallback, useRef } from "react";
import { Liquid } from "../ui/liquid";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2Icon, RefreshCwIcon, SendIcon } from "lucide-react";
import { cn, fetcher } from "@/lib/utils";
import { Suggestion as SuggestionType } from "@/lib/ai/suggestions";
import useSWR from "swr";
import { API_ROUTES } from "@/lib/apiRoutes";
import { motion } from "motion/react";

const PureSuggestion = ({ suggestion, onClick }: { suggestion: SuggestionType, onClick: (suggestion: string) => void }) => {

    const handleClick = useCallback(() => {
        onClick(suggestion.content);
    }, [suggestion.content, onClick]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
        >
            <Button 
                variant={"secondary"} 
                className="rounded-full text-xs border bg-background/50 backdrop-blur"
                onClick={handleClick}
            >
                {suggestion.title}
            </Button>
        </motion.div>
    );
}

const Suggestion = memo(PureSuggestion, (prev, next) => {
    // Only re-render if the content of the suggestion changes
    return prev.suggestion.content === next.suggestion.content;
});

const PureSuggestions = ({ onClick, chatId }: { onClick: (suggestion: string) => void, chatId: string }) => {

    // Fetch suggestions from the API
    // this should only update when mutate is called
    const { data: suggestions, mutate, isLoading, isValidating } = useSWR<SuggestionType[]>(API_ROUTES.GET_SUGGESTIONS + chatId, fetcher, {
        revalidateOnFocus: false,
        revalidateOnMount: false,
        revalidateOnReconnect: false,
        // refreshInterval: 0, // Disable automatic refresh
        // shouldRetryOnError: true, // Disable retry on error
        // keepPreviousData: true, // Keep previous data while loading new data
    })

    const handleMutate = () => {
        mutate();
    }

    return (
        <div className="flex flex-row flex-nowrap gap-2 overflow-x-auto relative z-10 ">
            {suggestions?.map((suggestion) => (
                <Suggestion 
                    key={`suggestion-${suggestion.content}`} 
                    suggestion={suggestion} 
                    onClick={onClick}
                />
            ))}
            <Button className="text-muted-foreground" disabled={isLoading || isValidating} onClick={handleMutate} size={"icon"} variant={"ghost"}>
                {(isLoading || isValidating) ? <RefreshCwIcon className="animate-spin" /> : <RefreshCwIcon />}
            </Button>
        </div>
    );
}

const Suggestions = memo(PureSuggestions, (prev, next) => {
    // Only re-render if the suggestions change
    if (prev.onClick !== next.onClick) return false;
    if (prev.chatId !== next.chatId) return false;

    return true;
});

type Props = {
    submitMiddleWare: (input: string) => void;
    isLoading: boolean,
    chatId?: string;
}

const PurePromptInput = (props: Props) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (props.isLoading) return;
        if(!inputRef.current) { return; }

        inputRef.current.blur();

        props.submitMiddleWare(inputRef.current.value);

        // clear the input field
        inputRef.current.value = "";

    }

    /**
     * Handle key down events for the input field.
     * This allows for shortcuts like Ctrl+Enter or Shift+Enter to add a new line,
     * 
     * @param e 
     * @returns 
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputKeyDown = (e: any) => {
        // only do shortcuts on desktop
        if(window.innerWidth < 768) return;

        if((e.key === "Enter" && e.ctrlKey) || (e.key === "Enter" && e.shiftKey)) {
            // add a new line
            if(inputRef.current) {
                inputRef.current.value += "\n\n";
            }
        } else if(e.key === "Enter") {
            // submit
            e.preventDefault();
            handleSubmit();
        }
    }

    const handleClickSuggestion = useCallback((suggestion: string) => {
        if(!inputRef.current) return;
        inputRef.current.value = suggestion;
        inputRef.current.focus();
    }, [])

    return (
        <div className='fixed bottom-0 left-0 w-full p-2 pb-6 max-md:pb-2 flex flex-col items-center gap-1'>
            <div className="flex flex-col gap-2 w-full max-w-[760px]">
                {props.chatId && <Suggestions onClick={handleClickSuggestion} chatId={props.chatId} />}
                <form onSubmit={handleSubmit} className="relative w-full">
                    <Liquid className={cn("transition-all rounded-3xl size-full  overflow-hidden")}>
                        <Textarea 
                            placeholder="Type your message here..."
                            className={cn("transition-all resize-none size-full !bg-black/50 border-none focus:ring-0 focus:border-none flex items-center justify-center p-4 pr-12")}
                            rows={1}
                            name='prompt'
                            autoFocus
                            ref={inputRef}
                            onKeyDown={handleInputKeyDown}
                        />
                    </Liquid>
                    <div className='absolute bottom-0 right-0 h-full flex items-end justify-center p-2 pb-4'>
                        <Button variant={"secondary"} disabled={props.isLoading} className='z-10 rounded-full p-4' size={"icon"} type='submit'>
                            {props.isLoading ? <Loader2Icon className="animate-spin text-primary" /> : <SendIcon />}
                        </Button>
                    </div>
            
                </form>
            </div>
        </div>
  );
}

export const PromptInput = memo(PurePromptInput, (prev, next) => {
    if(prev.isLoading !== next.isLoading) return false;
    if(prev.submitMiddleWare !== next.submitMiddleWare) return false;
    if(prev.chatId !== next.chatId) return false;

    return true;
});