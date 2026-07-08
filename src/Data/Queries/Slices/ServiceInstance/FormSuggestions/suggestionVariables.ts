/**
 * Standalone `${...}` engine for a suggestion's parameter name.
 *
 * Extract and substitute are deliberately two separate operations that run at
 * different times. Extract takes just the parameter name and returns data: the
 * list of variables it references. It runs the moment the annotation loads,
 * before any value exists, and answers "what does this parameter name depend
 * on?". Substitute takes the parameter name plus the now-known values and
 * produces the final string. The extract output is what lets callers skip a
 * fetch while a required value is absent, flag an unknown variable as a model
 * error at load time, and build a field dependency graph over all annotations.
 *
 * The `${...}` content is never evaluated: it is parsed into a namespace and
 * used as a lookup key, and substituted values are URL-encoded.
 */

/**
 * The namespaces the form can currently provide a value for.
 */
export const SUGGESTION_NAMESPACES = [
  "entity_type",
  "identifying_attribute",
  "instance_id",
] as const;

export type SuggestionNamespace = (typeof SUGGESTION_NAMESPACES)[number];

/**
 * The values available for substitution, keyed by namespace.
 * An absent or empty entry means "no value (yet)".
 */
export type SuggestionVariables = Partial<Record<SuggestionNamespace, string>>;

/** Extracts the namespaces between brackets */
const suggestionVariablePattern = /\$\{([^}]*)\}/g;

/**
 * Type guard narrowing a raw namespace string to a supported {@link SuggestionNamespace}.
 *
 * @param namespace - The raw namespace parsed out of a `${...}` reference.
 * @returns Whether the namespace is one the form can provide a value for.
 */
export const isKnownNamespace = (namespace: string): namespace is SuggestionNamespace =>
  SUGGESTION_NAMESPACES.some((known) => known === namespace);

/**
 * Extracts the `${...}` variables a parameter name references.
 *
 * Unknown namespaces are extracted too - validating them is the caller's
 * concern (see {@link isKnownNamespace}), so the full dependency list stays
 * available for error reporting.
 *
 * @param parameterName - The parameter name, e.g. `"topology_files_${entity_type}"`.
 * @returns The referenced namespaces, deduplicated, in order of first appearance.
 */
export const extractVariables = (parameterName: string): string[] => {
  const namespaces = new Set<string>();

  for (const match of parameterName.matchAll(suggestionVariablePattern)) {
    namespaces.add(match[1]);
  }

  return [...namespaces];
};

/**
 * Returns the `${...}` namespaces a parameter name references that the form
 * cannot provide a value for. An empty result means the parameter name is
 * model-valid.
 *
 * This is the single source of truth for "is this annotation broken?", shared by
 * the suggestions hook (behavior) and any UI that reports the error. Pure and
 * static: it depends only on the parameter name, never on form values.
 *
 * @param parameterName - The parameter name, e.g. `"topology_files_${entity_typo}"`.
 * @returns The unknown namespaces, in order of first appearance (empty if none).
 */
export const getUnknownNamespaces = (parameterName: string): string[] =>
  extractVariables(parameterName).filter((namespace) => !isKnownNamespace(namespace));

/**
 * Substitutes every `${...}` variable in a parameter name with its URL-encoded value.
 *
 * Purely mechanical: callers are expected to have validated the parameter name with
 * {@link extractVariables} first. A variable without a value substitutes to "".
 *
 * @param parameterName - The parameter name, e.g. `"topology_files_${entity_type}"`.
 * @param variables - The values to substitute, keyed by namespace.
 * @returns The resolved string, e.g. `"topology_files_Connection"`.
 */
export const substituteVariables = (
  parameterName: string,
  variables: SuggestionVariables
): string =>
  parameterName.replace(suggestionVariablePattern, (_match, namespace: string) =>
    encodeURIComponent(variables[namespace] ?? "")
  );
