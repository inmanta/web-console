import { InstanceAttributeModel } from "@/Core";
import { CustomError } from "@/Data/Queries/Helpers";

/**
 * Turns a failed instance submit into per-attribute validation errors. LSM validates attributes
 * with pydantic: newer versions return the errors in `error_details.validation_errors`, older ones
 * only in the message, as pydantic's text rendering. Both carry the same location and message.
 */

/** One attribute validation error. `path` uses the form's dotted path format, e.g. `endpoint.1.port`. */
export interface AttributeValidationError {
  path: string;
  message: string;
}

/**
 * The parsed validation errors of a failed submit. `summary` is the message without pydantic's
 * error listing, empty when the message held nothing else.
 */
export interface ValidationErrorReport {
  summary: string;
  errors: AttributeValidationError[];
}

/** One entry of pydantic's error list, as LSM returns it in `error_details.validation_errors`. */
interface PydanticError {
  loc: (string | number)[];
  msg: string;
}

const isPydanticError = (value: unknown): value is PydanticError =>
  typeof value === "object" &&
  value !== null &&
  "loc" in value &&
  Array.isArray(value.loc) &&
  "msg" in value &&
  typeof value.msg === "string";

const fromDetails = (details: unknown): AttributeValidationError[] => {
  if (typeof details !== "object" || details === null || !("validation_errors" in details)) {
    return [];
  }

  const errors = details.validation_errors;

  if (!Array.isArray(errors)) {
    return [];
  }

  return errors
    .filter(isPydanticError)
    .map(({ loc, msg }) => ({ path: loc.join("."), message: msg }));
};

// An example of the message LSM returns, with pydantic's errors as text:
//
//   Invalid request: 1 validation error for my-service
//   vlan_id
//     Input should be a valid integer [type=int_type, input_value='a', input_type=str]
//       For further information visit https://errors.pydantic.dev/2.14/v/int_type
//
// Each error is an attribute path, then its message indented by 2 spaces.
// Lines indented by 4 spaces are skipped.

// Matches "1 validation error for my-service".
const HEADER = /\d+ validation errors? for [^\n]*/;

// Matches "  Input should be a valid integer [type=...]" and keeps "Input should be a valid integer".
const MESSAGE = /^ {2}(\S.*?)(?: \[type=.*\])?$/;

// The core prefix and the punctuation that introduced the listing say nothing on their own.
const toSummary = (text: string): string =>
  text
    .replace(/^Invalid request:?/, "")
    .trim()
    .replace(/[:,]$/, "");

const fromText = (text: string): ValidationErrorReport | null => {
  const header = HEADER.exec(text);

  if (!header) {
    return null;
  }

  const errors: AttributeValidationError[] = [];
  let path: string | null = null;

  for (const line of text.slice(header.index + header[0].length).split("\n")) {
    const message = MESSAGE.exec(line);

    if (message && path !== null) {
      errors.push({ path, message: message[1] });
      path = null;
    } else if (/^\S/.test(line)) {
      path = line.trim();
    }
  }

  return { summary: toSummary(text.slice(0, header.index)), errors };
};

/**
 * The attribute validation errors of a failed submit, or null when the error is not an attribute
 * validation failure. Reads `error_details.validation_errors` when sent, else pydantic's text.
 *
 * @example
 * parseValidationErrors(new Error("Invalid request: 1 validation error for Svc\nvlan_id\n  Input should be a valid integer"))
 * // => { summary: "", errors: [{ path: "vlan_id", message: "Input should be a valid integer" }] }
 */
export const parseValidationErrors = ({
  message,
  details,
}: CustomError): ValidationErrorReport | null => {
  const parsedText = fromText(message);
  const structured = fromDetails(details);

  if (structured.length > 0) {
    return { summary: parsedText ? parsedText.summary : toSummary(message), errors: structured };
  }

  return parsedText && parsedText.errors.length > 0 ? parsedText : null;
};

/**
 * Whether a failed submit is an attribute validation failure, which the form shows on its fields
 * instead of in a toast.
 *
 * @example
 * isAttributeValidationFailure(new Error("Invalid request: The attribute attr1 is read-only")) // => false
 */
export const isAttributeValidationFailure = (error: CustomError): boolean =>
  parseValidationErrors(error) !== null;

/**
 * Whether `path` is `prefix` itself or lies below it.
 *
 * @example
 * isAtOrBelow("endpoint.1.port", "endpoint") // => true
 */
export const isAtOrBelow = (path: string, prefix: string): boolean =>
  path === prefix || path.startsWith(`${prefix}.`);

/**
 * The names of the top-level attributes whose value differs between two form states, in either
 * direction. Values are compared by their JSON text, as the JSON editor produces them.
 *
 * @example
 * getChangedAttributeNames({ vlan_id: 1, ip: "10.0.0.1" }, { vlan_id: 2, ip: "10.0.0.1" }) // => ["vlan_id"]
 */
export const getChangedAttributeNames = (
  before: InstanceAttributeModel,
  after: InstanceAttributeModel
): string[] => {
  const names = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changedNames: string[] = [];

  for (const name of names) {
    if (JSON.stringify(before[name]) !== JSON.stringify(after[name])) {
      changedNames.push(name);
    }
  }

  return changedNames;
};
