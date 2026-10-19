import { CustomError } from "@/Data/Queries/Helpers";

/**
 * Turns a rejected instance submit into per-attribute errors. LSM validates attributes with
 * pydantic: newer versions return the errors in `error_details.validation_errors`, older ones only
 * in the message, as pydantic's text rendering. Both carry the same location and message.
 */

/** One rejected attribute. `path` uses the form's dotted path format, e.g. `endpoint.1.port`. */
export interface AttributeValidationError {
  path: string;
  message: string;
}

/**
 * The parsed rejection. `summary` is the message without pydantic's error listing, empty
 * when the message held nothing else.
 */
export interface ValidationErrorReport {
  summary: string;
  errors: AttributeValidationError[];
}

interface PydanticError {
  loc: (string | number)[];
  msg: string;
}

const isPydanticError = (value: unknown): value is PydanticError =>
  typeof value === "object" &&
  value !== null &&
  Array.isArray((value as PydanticError).loc) &&
  typeof (value as PydanticError).msg === "string";

const fromDetails = (details: unknown): AttributeValidationError[] => {
  const errors = (details as { validation_errors?: unknown } | null)?.validation_errors;

  if (!Array.isArray(errors)) {
    return [];
  }

  return errors
    .filter(isPydanticError)
    .map(({ loc, msg }) => ({ path: loc.join("."), message: msg }));
};

// pydantic's text rendering: a header, then per error the location on its own line, the message
// indented by 2 (with a trailing "[type=...]"), and optionally a URL line indented by 4.
const HEADER = /\d+ validation errors? for [^\n]*/;
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
 * The attribute errors in a failed submit, or null when the error is not an attribute
 * validation failure.
 *
 * @param {CustomError} error - The failed request: its message and, if sent, its `error_details`.
 * @returns {ValidationErrorReport | null}
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
 * Whether `path` is `prefix` itself or lies below it.
 *
 * @example
 * isAtOrBelow("endpoint.1.port", "endpoint") // => true
 * isAtOrBelow("endpoints", "endpoint") // => false
 */
export const isAtOrBelow = (path: string, prefix: string): boolean =>
  path === prefix || path.startsWith(`${prefix}.`);
