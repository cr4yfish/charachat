import { memo, useCallback, useRef, useState } from "react";
import { TextareaWithAutosize } from "../ui/textarea";
import { Button } from "../ui/button";
import { PauseIcon, RefreshCwIcon, SendIcon } from "lucide-react";
import { cn, fetcher } from "@/lib/utils";
import { Suggestion as SuggestionType } from "@/lib/ai/suggestions";
import useSWR from "swr";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { AnimatePresence, motion } from "motion/react";

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
                className="rounded-full text-xs border text-white/75 bg-primary/25 backdrop-blur"
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
        <motion.div
            initial={{ opacity: 0,}}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0  }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            layout 
            className="absolute bottom-8 left-0 -translate-y-[30px] min-h-[36px] flex flex-row flex-nowrap gap-2 overflow-x-auto z-10 w-full transition-all ">
            <motion.div layout className="transition-normal">
                <Button className="text-muted-foreground transition-all" disabled={isLoading || isValidating} onClick={handleMutate} size={"icon"} variant={"ghost"}>
                    {(isLoading || isValidating) ? <RefreshCwIcon className="animate-spin" /> : <RefreshCwIcon />}
                </Button>
            </motion.div>           
            {suggestions?.map((suggestion) => (
                <Suggestion 
                    key={`suggestion-${suggestion.content}`} 
                    suggestion={suggestion} 
                    onClick={onClick}
                />
            ))}
        </motion.div>
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
    relative?: boolean; // if true, the input will be positioned relative to the parent container
}

const PurePromptInput = (props: Props) => {

    // This is used to get the input value from the textarea
    // and to focus/blur the input field
    // we're using a ref here to avoid re-rendering the component
    // when the input value changes
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // used for styling the input field
    // when the input field is focused, it expands to full width
    // autoFocus is set to true so that the input field is focused when the component mounts
    const [isFocused, setIsFocused] = useState(true);

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

    // only blur if the input is empty
    const handleBlur = useCallback(() => {
        if(inputRef.current) {
            if(inputRef.current.value.trim() === "") {
                setIsFocused(false);
            }
        }
    }, [inputRef]);

    return (
        <div id="prompt-input" 
            className={cn('absolute bottom-0 max-sm:bottom-8 left-0 w-full p-2 pb-6 max-md:pb-2 flex flex-col items-center gap-1', {
                "relative": props.relative,
            })}
        >
            <div className={cn("flex flex-col items-center gap-2 w-full max-w-[500px] relative")}>
                <AnimatePresence presenceAffectsLayout>
                    {props.chatId && isFocused && <Suggestions onClick={handleClickSuggestion} chatId={props.chatId} />}
                </AnimatePresence>
                <motion.form 
                    onSubmit={handleSubmit} 
                    className={cn("relative w-full")}
                    animate={{ width: isFocused ? "100%" : "250px" }}
                >
                    <TextareaWithAutosize 
                        className={cn("!bg-background/50 border-none focus:ring-0 focus:border-none pr-12")}
                        minRows={1}
                        placeholder="Send a message"
                        name='prompt'
                        autoFocus
                        ref={inputRef}
                        onKeyDown={handleInputKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={handleBlur}
                        endContent={
                            <motion.div layout className=''>
                                <Button variant={"secondary"} className='z-10 rounded-full p-4 transition-all shrink-0 min-h-[36px] !size-[36px]' size={"icon"} type='submit'>
                                    {props.isLoading ? <PauseIcon fill="currentColor" /> : <SendIcon />}
                                </Button>
                            </motion.div>
                        }
                    />

            
                </motion.form>
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