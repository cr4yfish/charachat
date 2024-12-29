import { Character } from "@/types/db";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { placeholderImage } from "./defaults";

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

export const truncateText = (text: string, maxLength=40) => {
  if(!text) return '';

  if (text.length <= maxLength) {
      return text;
  }
  return text.substring(0, maxLength) + '...';
};

/**
 * Holy shit this is so stupid
 * @param string 
 * @returns 
 */
export function isValidURL(string: string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  } 
}

export function safeParseLink(link: string | undefined | null): string {
  if(link && isValidURL(link) && link.includes("https://")) {
    return link;
  }
  return placeholderImage;
}

export const _INTRO_MESSAGE = (character: Character, username: string): string => {
  const variables = getChatVariables(username, character.name)

  return `
    [Do not use any tools for your next response]
    ${character.first_message && `
      Repeat the following text in your response to get the chat started (the user doesnt see this message): 
      ${replaceVariables(character.first_message, variables)}  
    `}

    ${character.intro && `
      This is how you would introduce yourself. Use this to create a first message:
      ${replaceVariables(character.intro, variables)}
    `}

    ${character.scenario && `
      Repeat the following text in your response to get the chat started (the user doesnt see this message): 
      ${replaceVariables(character.scenario, variables)}  
    `}
  `
};

export async function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(async () => {
        resolve();
    }, ms);
  })
}

export function replaceVariables(text = "", variables: Record<string, string>) {
  return text.replace(/\${(.*?)}/g, (_, match) => {
    return variables[match] || '';
  });
}

export const getChatVariables = (username: string, charName: string): Record<string, string> => {
  return {
    "{{user}}": username,
    "{{char}}": charName
  }
}