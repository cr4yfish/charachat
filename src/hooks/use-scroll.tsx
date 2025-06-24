import { useEffect, useRef, useState, type RefObject } from 'react';

export function useScroll<T extends HTMLElement>(): [
  RefObject<T | null>,
  RefObject<T | null>,
  RefObject<T | null>,
  number,
  (height: number) => void ,
  () => void
] {
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [actualContentHeight, setActualHeight] = useState<number>(0);

  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  const scrollRef = useRef<T>(null);

  // keep track of the actual height
  useEffect(() => {
    if(!containerRef.current) return;

    setContentHeight(containerRef.current.scrollHeight);
    setActualHeight(containerRef.current.scrollHeight);
    scrollTo(containerRef.current.scrollHeight, "auto");
    
    const resizeObserver = new ResizeObserver(entries => {
      const observedHeight = entries[0].contentRect.height;
      setActualHeight(observedHeight);
    })

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    }
  }, [containerRef])

  useEffect(() => {
    // if the actual content height is greater than the content height, then update the content height
    if(actualContentHeight > contentHeight) {
      setContentHeight(actualContentHeight)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualContentHeight])

  const addHeight = (height: number) => {
    setContentHeight(contentHeight + height)
  }

  const scrollTo = (pos: number, behavior: ScrollBehavior = "smooth") => {
    if(!scrollRef.current) return;

    requestAnimationFrame(() => {
      scrollRef.current!.scrollTo({
        top: pos,
        behavior: behavior
      })
    })
  }

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if(scrollRef.current == undefined) return;
      scrollTo(scrollRef.current.scrollHeight);
    })
  }

  return [
    containerRef, 
    endRef, 
    scrollRef,
    contentHeight, 
    addHeight, 
    scrollToBottom
  ];
}
