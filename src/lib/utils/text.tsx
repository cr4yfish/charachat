import { placeholderImage } from "@/lib/constants/defaults";


/**
 * Custom truncate function that truncates text to a specified length and adds "..." if it exceeds that length.
 * If the text is shorter than or equal to the specified length, it returns the text as is.
 * 
 * @param text 
 * @param maxLength 
 * @returns 
 */
export const truncateText = (text: string | undefined, maxLength=40) => {
  if(!text) return '';

  if (text.length <= maxLength) {
      return text;
  }
  return text.substring(0, maxLength) + '...';
};

/**
 * Prints to local strings, but with extra details:
 * 
 * adds shorthands, like "k" or "m" for thousands and millions
 * @param num 
 * @returns 
 */
export const truncateNumber = (num: number | undefined) => {
  if (num === undefined || num === null) return '';

  if (num < 1000) {
      return num.toString();
  } else if (num < 1000000) {
      const truncated = (num / 1000).toFixed(0);
      return `${truncated}k`;
  } else if (num < 1000000000) {
      const truncated = (num / 1000000).toFixed(0);
      return `${truncated}m`;
  } else {
      const truncated = (num / 1000000000).toFixed(0);
      return `${truncated}b`;
  }
}

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

export function replaceVariables(text = "", variables?: Record<string, string>) {
  if(!text || !variables) {
    return text;
  }
  return text?.replace(/\${(.*?)}/g, (_, match) => {
    return variables[match] || '';
  });
}

export const getChatVariables = (username: string, charName: string): Record<string, string> => {
  return {
    "{{user}}": username,
    "{{char}}": charName
  }
}



/**
 * Estimates the number of lines a text will wrap into, very roughly and very fast.
 * This method is based on character count and is NOT accurate for varying character widths.
 *
 * @param {string} text The text content.
 * @param {number} maxWidth The maximum width available for the text (in pixels).
 * @param {number} avgCharWidth An estimated average pixel width of a single character for your font.
 * You'll need to determine this value empirically (e.g., by measuring a common character like 'x' or 'n' or an average word).
 * A reasonable starting point for 14px sans-serif might be 7-8px.
 * @returns {number} The estimated number of lines.
 */
export const estimateLinesRoughly = (text: string, maxWidth: number, avgCharWidth: number) => {
  if (!text) {
    return 0;
  }
  if (maxWidth <= 0 || avgCharWidth <= 0) {
    return text.length > 0 ? 1 : 0; // If no space, at least one line for non-empty text
  }

  // 1. Calculate estimated characters per line
  const charsPerLine = Math.floor(maxWidth / avgCharWidth);

  if (charsPerLine <= 0) {
    // If even one character doesn't fit, each character takes a line
    return text.length;
  }

  // 2. Calculate total lines
  const totalCharacters = text.length; // Simple char count, doesn't distinguish wide/narrow chars
  let estimatedLines = Math.ceil(totalCharacters / charsPerLine);

  // Ensure at least 1 line for non-empty text
  if (estimatedLines === 0 && text.length > 0) {
    estimatedLines = 1;
  }

  return estimatedLines;
};