export type TraceSetId = "upper" | "lower" | "digits";

export interface TraceSet {
  id: TraceSetId;
  label: string;
  chars: string[];
}

const range = (from: string, to: string): string[] =>
  Array.from({ length: to.charCodeAt(0) - from.charCodeAt(0) + 1 }, (_, i) => String.fromCharCode(from.charCodeAt(0) + i));

export const TRACE_SETS: TraceSet[] = [
  { id: "upper", label: "Capital letters", chars: range("A", "Z") },
  { id: "lower", label: "Small letters", chars: range("a", "z") },
  { id: "digits", label: "Numbers", chars: range("0", "9") },
];

/** Height of a lowercase letter's body as a fraction of the capital height (used for the middle guide line). */
export function midLineRatio(char: string): number {
  return /[a-z]/.test(char) ? 0.73 : 0.5;
}
