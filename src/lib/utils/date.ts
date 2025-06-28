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

/**
 * Formats a date object into a human-readable string.
 * Works on both server and client side.
 * Agnostic to the user's locale!
 * (-> Won't throw hydration errors if browser and server have different locales)
 * @param date 
 * @returns string
 */

type PrettyPrintDateOptions = {
  group?: "day" | "month" | "year",
  short?: boolean;
}

export function prettyPrintDate(date: Date | string, userOptions?: PrettyPrintDateOptions) {
  let dateObj: Date;

  if(typeof date === "string") {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  // Handle relative date formatting
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // If today: Show time ago
  if (isToday(dateObj)) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours >= 1) {
      return `${diffHours}h ago`;
    } else if (diffMinutes >= 1) {
      return `${diffMinutes}m ago`;
    } else {
      return "Just now";
    }
  }
  
  // If yesterday
  if (isYesterday(dateObj)) {
    return "Yesterday";
  }
  
  // If within 7 days
  if (diffDays >= 2 && diffDays <= 7) {
    return `${diffDays} days ago`;
  }
    
  

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  if (userOptions?.group === "day") {
    options.month = '2-digit';
    options.day = '2-digit';
  } else if (userOptions?.group === "month") {
    options.day = undefined;
    options.hour = undefined;
    options.minute = undefined;
  } else if (userOptions?.group === "year") {
    options.month = undefined;
    options.day = undefined;
  }

  if(userOptions?.short) {
    options.minute = undefined;
    options.year = undefined;
  }

  return new Intl.DateTimeFormat('en-US', options).format(dateObj).replace(/(\d+(?::\d+)?)\s+(AM|PM)/g, (time, ampm) => time + ampm.toLowerCase());
}