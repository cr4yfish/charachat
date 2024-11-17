import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const framerListAnimationProps = {
  initial: "hidden",
  animate: "visible",
  variants: {
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
    },
  }),
  hidden: { opacity: 0, y: 30 },
}}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
}

export function getDayBefore(date: Date): Date {
  const yesterday = new Date(date);
  yesterday.setDate(date.getDate() - 1);
  return yesterday;
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isYesterday(date: Date): boolean {
  return isSameDay(date, getDayBefore(new Date()));
}

export function isThisWeek(date: Date): boolean {
  const today = new Date();
  const day = date.getDay();
  return isSameDay(date, today) || (date > getDayBefore(today) && day >= today.getDay());
}

/**
 * Returns either:
 * - {time} if the message was sent today
 * - {Weekday abbreviation} if the message was sent this week
 * - {local date string} if the message was sent before this week
 * @param date 
 */
export function formatLastMessageTime(date: Date): string {
  if(isToday(date)) {
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  }

  if(isThisWeek(date)) {
    return date.toLocaleDateString([], {weekday: 'short'});
  }

  return date.toLocaleDateString();
  
}

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) {
      return text;
  }
  return text.substring(0, maxLength) + '...';
};


export const _INTRO_MESSAGE = "Introduce yourself and if there is a story: Recap the story in your message.";