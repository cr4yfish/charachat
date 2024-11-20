


export const fadeInFromBottom = {
    initial: { y: 25, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 25, opacity: 0 }
}

export const fadeOutToTop = {
    animate: { y: 0, opacity: 1 },
    exit: { y: -25, opacity: 0 }
}

export const exitToLeft = {
    animate: { x: 0 },
    exit: { x: -1000 }
}

export const entryFromRight = {
    initial: { x: 1000 },
    animate: { x: 0 },
}