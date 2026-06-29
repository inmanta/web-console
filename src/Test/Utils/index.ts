import { within } from "@testing-library/react";
import { words } from "@/UI/words";

export const getById = (id: string): HTMLElement => {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`No element found with id: "${id}"`);
  }

  return el;
};

/**
 * Query the True/False toggle of an optional boolean attribute rendered by `FieldInput`.
 *
 * Specific to that rendering: the field is wrapped in a group labelled `BooleanFieldInput-${name}`
 * and each option is a toggle button whose accessible name is the `words("true"/"false")` label.
 * Shared here because `CreateInstance` and `EditInstance` tests both need it and have no common
 * parent slice.
 *
 * @param name - the boolean attribute name
 * @param value - which toggle to return ("true" or "false")
 * @param container - element to scope the search to (defaults to the whole document)
 * @returns the matching toggle button element
 */
export const getBooleanFieldOption = (
  name: string,
  value: "true" | "false",
  container: HTMLElement = document.body
): HTMLElement => {
  const group = within(container).getByRole("generic", { name: `BooleanFieldInput-${name}` });

  return within(group).getByRole("button", { name: words(value) });
};
