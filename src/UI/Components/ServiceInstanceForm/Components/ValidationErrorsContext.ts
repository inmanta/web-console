import { createContext, useContext } from "react";
import { words } from "@/Core";
import { AttributeValidationError, isAtOrBelow } from "../Helpers";

/** The validation errors of the last submit whose attributes the user has not edited since. */
export const ValidationErrorsContext = createContext<AttributeValidationError[]>([]);

/**
 * The validation error messages for the attribute at `path`, joined, or undefined when there are
 * none. A leaf input also owns the errors below it: pydantic adds the list index of a list element
 * and the member type of a union to the location (e.g. `vlans.2`, `mtu.int`).
 *
 * @example
 * // with the error { path: "mtu.int", message: "Input should be a valid integer" } in context
 * useValidationError("mtu", true) // => "Input should be a valid integer"
 */
export const useValidationError = (path: string, isLeaf: boolean): string | undefined => {
  const messages = useContext(ValidationErrorsContext)
    .filter((error) => (isLeaf ? isAtOrBelow(error.path, path) : error.path === path))
    .map((error) => error.message);

  return messages.length > 0
    ? messages.join(words("inventory.form.validationErrors.messageSeparator"))
    : undefined;
};
