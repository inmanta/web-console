import { useRef } from "react";
import { SelectOptionProps } from "@patternfly/react-core";

/**
 * Remembers the display name of every option a select has been given, so a selected value keeps its name
 * when a search narrows the options down to a list without it. Names are kept as text, and a value that was
 * never among the options returns undefined. Writing the names while rendering is safe, since writing a name again changes nothing.
 */
export const useOptionDisplayNames = (options: SelectOptionProps[]) => {
  const displayNames = useRef(new Map<string, string>());

  options.forEach(({ value, children }) => {
    if (value !== undefined && children) {
      displayNames.current.set(String(value), String(children));
    }
  });

  const getDisplayName = (value: string): string | undefined => displayNames.current.get(value);

  return getDisplayName;
};
