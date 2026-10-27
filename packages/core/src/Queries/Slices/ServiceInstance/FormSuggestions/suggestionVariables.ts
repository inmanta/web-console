/**
 * The low-level `${...}` engine: parses references out of a suggestion's parameter name or
 * graphql filter, and substitutes resolved values back in. Extract runs at load time (before
 * any value) to answer "what does this depend on?"; substitute runs later with the known
 * values. References are never evaluated - only parsed into a key and looked up.
 *
 *   extractReferences    string -> every ${...} ref, classified (context/field/unknown), deduped
 *   parseReference       one ${...} body -> its classification
 *   isFieldReference     narrows a parsed ref to a field ref
 *   substituteVariables  string + value map -> the string with every ${...} replaced
 */

/**
 * The context namespaces a `${...}` reference may name. The first three are form-derived
 * (supplied by the caller); `environment` is filled by the suggestions hook with the
 * active environment UUID.
 *
 * @example
 * "${entity_type}" // -> namespace "entity_type"
 */
export const SUGGESTION_NAMESPACES = [
  "entity_type",
  "identifying_attribute",
  "instance_id",
  "environment",
] as const;

export type SuggestionNamespace = (typeof SUGGESTION_NAMESPACES)[number];

/**
 * Context values available for substitution, keyed by namespace; an absent or empty entry
 * means "no value yet".
 *
 * @example
 * { entity_type: "network", environment: "abc-123" }
 */
export type SuggestionVariables = Partial<Record<SuggestionNamespace, string>>;

/**
 * The scopes a cascading field reference may resolve against: `form` reads from
 * the form root, `self` from the field's own embedded instance. A `${...}` beginning
 * `form.`/`self.` is always a field reference.
 *
 * @example
 * "${self.region}" // -> scope "self"
 */
export const FIELD_SCOPES = ["form", "self"] as const;

export type FieldScope = (typeof FIELD_SCOPES)[number];

/**
 * A parsed `${form.<path>}` / `${self.<path>}` reference: `path` is a jsonpath evaluated
 * against the scope's data, and `raw` is the exact `${...}` content reused as the
 * substitution-map key.
 *
 * @example
 * { scope: "form", path: "site", raw: "form.site" }
 */
export interface FieldReference {
  scope: FieldScope;
  path: string;
  raw: string;
}

/**
 * The value map {@link substituteVariables} reads from, keyed by raw `${...}` content,
 * carrying both context values and resolved field references so one pass fills every
 * reference.
 *
 * @example
 * { entity_type: "network", "form.site": "site-a" }
 */
export type SubstitutionValues = Record<string, string | undefined>;

/** Extracts the namespaces between brackets */
const suggestionVariablePattern = /\$\{([^}]*)\}/g;

/** Matches a field reference, splitting scope from jsonpath on the first dot. */
const fieldReferencePattern = /^(form|self)\.(.+)$/;

/**
 * Whether a raw namespace is one the form can supply a context value for.
 *
 * @example
 * isKnownNamespace("entity_type") // => true
 * isKnownNamespace("form.site")   // => false
 */
export const isKnownNamespace = (namespace: string): namespace is SuggestionNamespace =>
  SUGGESTION_NAMESPACES.some((known) => known === namespace);

/**
 * The raw `${...}` contents referenced in a string, deduplicated in order of first
 * appearance. Unknown ones are included too - validating them is the caller's job.
 *
 * @example
 * extractVariables("files_${entity_type}") // => ["entity_type"]
 */
export const extractVariables = (parameterName: string): string[] => {
  const namespaces = new Set<string>();

  for (const match of parameterName.matchAll(suggestionVariablePattern)) {
    namespaces.add(match[1]);
  }

  return [...namespaces];
};

/**
 * A `${...}` reference classified by kind: a known `context` namespace, a `field`
 * reference into another field, or an `unknown` reference (a model error). `raw` is the
 * original `${...}` content in every case.
 *
 * @example
 * { kind: "Field", scope: "form", path: "site", raw: "form.site" }
 */
export type ParsedReference =
  | { kind: "Context"; namespace: SuggestionNamespace; raw: string }
  | ({ kind: "Field" } & FieldReference)
  | { kind: "Unknown"; raw: string };

/**
 * Narrows a parsed reference to a field reference (drops context/unknown).
 *
 * @example
 * references.filter(isFieldReference) // => only the ${form.*}/${self.*} refs
 */
export const isFieldReference = (
  reference: ParsedReference
): reference is { kind: "Field" } & FieldReference => reference.kind === "Field";

/**
 * Classifies one raw `${...}` content: `form.`/`self.` (with a non-empty path) is a field
 * reference, a known namespace is `context`, anything else is `unknown`.
 *
 * @example
 * parseReference("form.site")   // => { kind: "Field", scope: "form", path: "site", raw: "form.site" }
 * parseReference("entity_type") // => { kind: "Context", namespace: "entity_type", raw: "entity_type" }
 */
export const parseReference = (raw: string): ParsedReference => {
  const match = raw.match(fieldReferencePattern);

  if (match) {
    return { kind: "Field", scope: match[1] as FieldScope, path: match[2], raw };
  }
  if (isKnownNamespace(raw)) {
    return { kind: "Context", namespace: raw, raw };
  }

  return { kind: "Unknown", raw };
};

/**
 * Parses every `${...}` reference in a string, classified and deduplicated by raw content.
 * This is the structural extract step the dependency graph and blocking build on.
 *
 * @example
 * extractReferences("f_${form.site}") // => [{ kind: "Field", scope: "form", path: "site", raw: "form.site" }]
 */
export const extractReferences = (input: string): ParsedReference[] =>
  extractVariables(input).map(parseReference);

/**
 * Replaces every `${...}` in a string with its (encoded) value; a reference without a value
 * becomes "". `encode` defaults to `encodeURIComponent` (REST path); graphql passes identity
 * and quotes the value itself.
 *
 * @example
 * substituteVariables("files_${entity_type}", { entity_type: "network" }) // => "files_network"
 */
export const substituteVariables = (
  input: string,
  variables: SubstitutionValues,
  encode: (value: string) => string = encodeURIComponent
): string =>
  input.replace(suggestionVariablePattern, (_match, namespace: string) =>
    encode(variables[namespace] ?? "")
  );
