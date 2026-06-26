import { SuggestionValue } from "@/Core";

/**
 * Resolves the label to display for a submitted value (reverse lookup),
 * falling back to the value itself when no suggestion matches.
 */
export const resolveLabel = (
  suggestions: SuggestionValue[] | null | undefined,
  value: unknown
): string =>
  suggestions?.find((suggestion) => suggestion.value === String(value ?? ""))?.label ??
  String(value ?? "");

/**
 * Resolves the value to submit for typed text: if it exactly matches a
 * suggestion's label, returns that suggestion's value; otherwise the text itself.
 */
export const resolveValue = (
  suggestions: SuggestionValue[] | null | undefined,
  text: string
): string => suggestions?.find((suggestion) => suggestion.label === text)?.value ?? text;
