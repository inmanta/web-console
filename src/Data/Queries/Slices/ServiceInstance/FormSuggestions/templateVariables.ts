/**
 * Standalone `${...}` template engine for annotation-driven form features.
 *
 * Extract and substitute are deliberately two separate operations that run at
 * different times. Extract takes just the template and returns data: the list
 * of variables it references. It runs the moment the annotation loads, before
 * any value exists, and answers "what does this template depend on?".
 * Substitute takes the template plus the now-known values and produces the
 * final string. The extract output is what lets callers skip a fetch while a
 * required value is absent, flag an unknown variable as a model error at load
 * time, and build a field dependency graph over all annotations.
 *
 * The `${...}` content is never evaluated: it is parsed into a namespace and
 * used as a lookup key, and substituted values are URL-encoded.
 */

/**
 * The namespaces the form can currently provide a value for.
 */
export const TEMPLATE_NAMESPACES = ["entity_type", "identifying_attribute", "instance_id"] as const;

export type TemplateNamespace = (typeof TEMPLATE_NAMESPACES)[number];

/**
 * A single `${...}` reference found in a template.
 */
export interface TemplateVariable {
  namespace: string;
}

/**
 * The values available for substitution, keyed by namespace.
 * An absent or empty entry means "no value (yet)".
 */
export type TemplateContext = Partial<Record<TemplateNamespace, string>>;

/** Extracts the namespaces between brackets */
const templateVariablePattern = /\$\{([^}]*)\}/g;

/**
 * Type guard narrowing a raw namespace string to a supported {@link TemplateNamespace}.
 *
 * @param namespace - The raw namespace parsed out of a `${...}` reference.
 * @returns Whether the namespace is one the form can provide a value for.
 */
export const isKnownNamespace = (namespace: string): namespace is TemplateNamespace =>
  TEMPLATE_NAMESPACES.some((known) => known === namespace);

/**
 * Extracts the `${...}` variables a template references.
 *
 * Unknown namespaces are extracted too - validating them is the caller's
 * concern (see {@link isKnownNamespace}), so the full dependency list stays
 * available for error reporting.
 *
 * @param template - The template, e.g. `"topology_files_${entity_type}"`.
 * @returns The referenced variables, deduplicated, in order of first appearance.
 */
export const extractVariables = (template: string): TemplateVariable[] => {
  const namespaces = new Set<string>();

  for (const match of template.matchAll(templateVariablePattern)) {
    namespaces.add(match[1]);
  }

  return [...namespaces].map((namespace) => ({ namespace }));
};

/**
 * Returns the `${...}` namespaces a template references that the form cannot
 * provide a value for. An empty result means the template is model-valid.
 *
 * This is the single source of truth for "is this annotation broken?", shared by
 * the suggestions hook (behavior) and any UI that reports the error. Pure and
 * static: it depends only on the template string, never on form values.
 *
 * @param template - The template, e.g. `"topology_files_${entity_typo}"`.
 * @returns The unknown namespaces, in order of first appearance (empty if none).
 */
export const getUnknownNamespaces = (template: string): string[] =>
  extractVariables(template)
    .map(({ namespace }) => namespace)
    .filter((namespace) => !isKnownNamespace(namespace));

/**
 * Substitutes every `${...}` variable in a template with its URL-encoded value.
 *
 * Purely mechanical: callers are expected to have validated the template with
 * {@link extractVariables} first. A variable without a value substitutes to "".
 *
 * @param template - The template, e.g. `"topology_files_${entity_type}"`.
 * @param context - The values to substitute, keyed by namespace.
 * @returns The resolved string, e.g. `"topology_files_Connection"`.
 */
export const substituteVariables = (template: string, context: TemplateContext): string =>
  template.replace(templateVariablePattern, (_match, namespace: string) =>
    encodeURIComponent(context[namespace] ?? "")
  );
