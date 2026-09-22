/**
 * Domain types for reference-backed values in a resource's desired state.
 *
 * A reference is a value the compiler may not know (a secret, a fact): the exporter
 * leaves the attribute `null` and records the recipe in `details.attributes` as
 * `mutators` (one `core::Replace` per replaced value) and `references` (the nodes,
 * uuid-keyed). The `Raw*` types mirror that payload; the rest are normalized for the
 * UI. The console draws the recipe, never resolves it.
 */

/**
 * One entry in a reference or mutator's `args` (a serialized constructor call):
 * `name` is the parameter, `type` the argument kind - unrelated to a node's own
 * `type`. The remaining fields depend on the kind, so all are optional.
 */
export interface RawArgument {
  name: string;
  type: string;
  value?: unknown;
  id?: string;
  references?: Record<string, RawReferenceRef>;
  dict_path_expression?: string;
}

/**
 * A reference pointer inside an `mjson` argument's `references` map, keyed by the
 * jsonpath destination it fills.
 */
export interface RawReferenceRef {
  id: string;
  name: string;
  type: string;
}

/**
 * A reference node as carried in `attributes.references`. `type` is the
 * registered class (for example `std::Environment`).
 */
export interface RawReference {
  id: string;
  type: string;
  args: RawArgument[];
}

/**
 * A mutator as carried in `attributes.mutators`. Today the exporter only emits
 * `core::Replace`, but other types can appear and are counted, not rendered.
 */
export interface RawMutator {
  type: string;
  args: RawArgument[];
}

/** The one mutator type the console interprets. */
export const REPLACE_MUTATOR_TYPE = "core::Replace";

/**
 * A single normalized argument the UI renders. The discriminant is `kind`.
 *
 * - `literal` / `json`: a value rendered through the AttributeClassifier pipeline
 * - `mjson`: a json value with replacements of its own, listed under it
 * - `reference`: points at another node by id, rendered as an expandable child
 * - `resource`: a resource id, rendered as a link
 * - `python_type`: a type name such as `"str"`, rendered as monospace text
 * - `get`: a dictpath expression, rendered as unresolved monospace text
 * - `unknown`: any kind this build does not model, rendered from its raw payload
 *
 * @example { kind: "literal", name: "name", value: "NETBOX_API_TOKEN" }
 */
export type Argument =
  | LiteralArgument
  | JsonArgument
  | MjsonArgument
  | ReferenceArgument
  | ResourceArgument
  | PythonTypeArgument
  | GetArgument
  | UnknownArgument;

interface ArgumentBase {
  name: string;
}

export interface LiteralArgument extends ArgumentBase {
  kind: "literal";
  value: unknown;
}

export interface JsonArgument extends ArgumentBase {
  kind: "json";
  value: unknown;
}

export interface MjsonArgument extends ArgumentBase {
  kind: "mjson";
  value: unknown;
  replacements: Replacement[];
}

export interface ReferenceArgument extends ArgumentBase {
  kind: "reference";
  referenceId: string;
}

export interface ResourceArgument extends ArgumentBase {
  kind: "resource";
  resourceId: string;
}

export interface PythonTypeArgument extends ArgumentBase {
  kind: "python_type";
  value: string;
}

export interface GetArgument extends ArgumentBase {
  kind: "get";
  expression: string;
}

export interface UnknownArgument extends ArgumentBase {
  kind: "unknown";
  type: string;
  raw: unknown;
}

/**
 * A normalized reference node: its id, its registered class `type`, and its
 * arguments already normalized into the {@link Argument} union.
 */
export interface Reference {
  id: string;
  type: string;
  args: Argument[];
}

/**
 * One replaced value, flattened from a mutator or an `mjson` argument's `references`
 * map. `destination` is the raw jsonpath, `attributeKey` its first segment,
 * `isWholeAttribute` whether that is the only segment, `referenceId` the node used.
 *
 * @example { destination: "api.'api_token'", attributeKey: "api", isWholeAttribute: false, referenceId: "342e665e-..." }
 */
export interface Replacement {
  destination: string;
  attributeKey: string;
  isWholeAttribute: boolean;
  referenceId: string;
}

/**
 * A lookup from reference id to its normalized node, used to walk the graph
 * without relying on the payload's (uuid-sorted, meaningless) list order.
 */
export type ReferenceIndex = Record<string, Reference>;

/** Narrows an argument to the literal kind, used to pick a reference's chip-label values. */
export const isLiteralArgument = (arg: Argument): arg is LiteralArgument => arg.kind === "literal";
