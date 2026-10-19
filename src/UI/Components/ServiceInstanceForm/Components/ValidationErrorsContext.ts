import { createContext, useContext } from "react";
import { AttributeValidationError, isAtOrBelow } from "../Helpers";

/** The server's rejections of the last submit that the user has not edited since. */
export const ValidationErrorsContext = createContext<AttributeValidationError[]>([]);

/**
 * The server's rejection of the attribute at `path`, or undefined when there is none.
 * A leaf input also owns the errors below it: pydantic adds the list index of a list element
 * and the member type of a union to the location (e.g. `vlans.2`, `mtu.int`).
 *
 * @param {string} path - The attribute's dotted path, e.g. `endpoint.1.port`.
 * @param {boolean} isLeaf - Whether the attribute is a single input rather than a group of fields.
 * @returns {string | undefined} The messages for that attribute, joined.
 */
export const useValidationError = (path: string, isLeaf: boolean): string | undefined => {
  const messages = useContext(ValidationErrorsContext)
    .filter((error) => (isLeaf ? isAtOrBelow(error.path, path) : error.path === path))
    .map((error) => error.message);

  return messages.length > 0 ? messages.join(" ") : undefined;
};
