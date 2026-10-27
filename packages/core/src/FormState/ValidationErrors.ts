import { InstanceAttributeModel } from "@inmanta/web-console-core";
import { CustomError } from "@inmanta/web-console-core/Queries/Helpers";

/**
 * Reads the attribute validation errors of a failed instance submit. LSM validates attributes with
 * pydantic and returns the errors in `error_details.attribute_validation_errors`.
 */

/** One attribute validation error. `path` uses the form's dotted path format, e.g. `endpoint.1.port`. */
export interface AttributeValidationError {
  path: string;
  message: string;
}

/** One entry of pydantic's error list, as LSM returns it in `error_details.attribute_validation_errors`. */
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

/**
 * The attribute validation errors of a failed submit, empty when the server sent none.
 *
 * @example
 * getAttributeValidationErrors({
 *   name: "Error",
 *   message: "Invalid request: ...",
 *   details: { attribute_validation_errors: [{ loc: ["vlan_id"], msg: "Input should be a valid integer" }] },
 * })
 * // => [{ path: "vlan_id", message: "Input should be a valid integer" }]
 */
export const getAttributeValidationErrors = ({
  details,
}: CustomError): AttributeValidationError[] => {
  if (
    typeof details !== "object" ||
    details === null ||
    !("attribute_validation_errors" in details) ||
    !Array.isArray(details.attribute_validation_errors)
  ) {
    return [];
  }

  return details.attribute_validation_errors
    .filter(isPydanticError)
    .map(({ loc, msg }) => ({ path: loc.join("."), message: msg }));
};

/**
 * Whether a failed submit is an attribute validation failure, which the form shows on its fields
 * instead of in a toast. The error's `message` is then not shown at all: it repeats the same
 * validation errors as pydantic's raw text.
 *
 * @example
 * isAttributeValidationFailure(new Error("Invalid request: The attribute attr1 is read-only")) // => false
 */
export const isAttributeValidationFailure = (error: CustomError): boolean =>
  getAttributeValidationErrors(error).length > 0;

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
