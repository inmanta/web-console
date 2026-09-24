import { Reference } from "@/Core/Domain";
import { classifyValue } from "./classifyValue";

const MAX_LITERAL_ARGS = 2;
const MAX_VALUE_LENGTH = 40;

// The chip-label value: classified and blanked like the full attribute view (a
// password shows ****, the undefined sentinel "undefined").
const displayValue = (name: string, value: unknown): string => {
  const classified = classifyValue(name, value);

  return classified.kind === "Undefined" ? "undefined" : classified.value;
};

const truncate = (value: string): string => {
  const collapsed = value.replace(/\s+/g, " ").trim();

  return collapsed.length > MAX_VALUE_LENGTH
    ? `${collapsed.slice(0, MAX_VALUE_LENGTH)}...`
    : collapsed;
};

/**
 * The chip label for a reference: its type plus up to two literal args as
 * `name=value`, truncated and password-masked. The uuid stays in the expanded header.
 *
 * @example summarize({ type: "std::Environment", args: [{ kind: "literal", name: "name", value: "NETBOX_API_TOKEN" }] })
 *   => "std::Environment(name=NETBOX_API_TOKEN)"
 */
export const summarize = (reference: Reference.Reference): string => {
  const literals = reference.args
    .filter(Reference.isLiteralArgument)
    .slice(0, MAX_LITERAL_ARGS)
    .map((arg) => `${arg.name}=${truncate(displayValue(arg.name, arg.value))}`);

  return literals.length > 0 ? `${reference.type}(${literals.join(", ")})` : reference.type;
};
