import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProperNoun } from "@/app/api/transcribe/utils"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Segments a transcription string into an array of plain text strings and ProperNoun objects.
 *
 * This function performs a greedy left-to-right tokenization of the transcription,
 * identifying and extracting proper nouns while preserving the surrounding text.
 * The matching is case-insensitive.
 *
 * @param transcription - The full transcription text to segment
 * @param properNouns - Array of ProperNoun objects to find and highlight in the text
 * @returns An array of segments where each element is either:
 *   - A plain string (text between proper nouns)
 *   - A ProperNoun object (matched proper noun)
 *   Returns the original transcription string if no proper nouns are provided or found.
 *
 * @example
 * const transcription = "I met John at Google headquarters";
 * const properNouns = [
 *   { original: "John", type: "person", corrections: [], confidence: "high" },
 *   { original: "Google", type: "company", corrections: [], confidence: "high" }
 * ];
 * const segments = segmentTranscription(transcription, properNouns);
 * // Returns: ["I met ", {ProperNoun: John}, " at ", {ProperNoun: Google}, " headquarters"]
 */
export function segmentTranscription(
  transcription: string,
  properNouns: ProperNoun[]
): string | (string | ProperNoun)[] {
  if (!transcription || properNouns.length === 0) {
    return transcription;
  }

  // Create a map of original text to proper noun for quick lookup
  const nounMap = new Map(properNouns.map(pn => [pn.original.toLowerCase(), pn]));

  // Split transcription into segments, preserving the proper nouns
  const segments: (string | ProperNoun)[] = [];
  let remaining = transcription;

  while (remaining.length > 0) {
    let earliestMatch: { index: number; noun: ProperNoun; match: string } | null = null;

    // Find the earliest occurring proper noun in the remaining text
    for (const [original, noun] of nounMap) {
      const index = remaining.toLowerCase().indexOf(original);
      if (index !== -1 && (earliestMatch === null || index < earliestMatch.index)) {
        earliestMatch = {
          index,
          noun,
          match: remaining.slice(index, index + original.length),
        };
      }
    }

    if (earliestMatch) {
      // Add text before the match
      if (earliestMatch.index > 0) {
        segments.push(remaining.slice(0, earliestMatch.index));
      }
      // Add the proper noun
      segments.push(earliestMatch.noun);
      // Continue with remaining text
      remaining = remaining.slice(earliestMatch.index + earliestMatch.match.length);
    } else {
      // No more matches, add the rest
      segments.push(remaining);
      break;
    }
  }

  return segments;
}