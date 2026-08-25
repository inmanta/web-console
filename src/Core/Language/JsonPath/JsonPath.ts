import { parse, query } from "jsonpathly";
import * as Maybe from "@/Core/Language/Maybe";

/**
 * Shared read-only jsonpath evaluator (RFC 9535, via the eval-free `jsonpathly`, chosen so
 * annotation-supplied paths can't execute code). Pinned to a navigational subset (member
 * access, array index, single equality-filter); everything else is rejected. A leading `$`
 * is optional (`a.b` is read as `$.a.b`).
 */

type AstNode = { type: string; [key: string]: unknown };

const isAstNode = (value: unknown): value is AstNode =>
  typeof value === "object" && value !== null && typeof (value as AstNode).type === "string";

/**
 * Prepends the RFC 9535 root `$.` when a path omits it, so authors can write `id` for `$.id`.
 *
 * @example
 * normalizePath("candidate_attributes.name") // => "$.candidate_attributes.name"
 */
const normalizePath = (path: string): string => {
  const trimmed = path.trim();

  return trimmed.startsWith("$") ? trimmed : `$.${trimmed}`;
};

/**
 * The jsonpathly AST node types that make up plain navigation: the structural spine, member
 * access, array index, and a single equality filter with its literal leaves. An allowlist on
 * purpose - any type not listed (wildcards, recursion, slices, unions, functions,
 * non-equality filters) is rejected, so a future construct fails closed.
 */
const NAVIGATIONAL_TYPES = new Set([
  "root",
  "subscript",
  "dot",
  "bracketMember",
  "bracketExpression",
  "filterExpression",
  "comparator",
  "current",
  "identifier",
  "stringLiteral",
  "numericLiteral",
  "value",
]);

/** Recursively checks that every node in the parsed AST stays within navigation. */
const isNavigational = (node: unknown): boolean => {
  if (Array.isArray(node)) {
    return node.every(isNavigational);
  }
  if (!isAstNode(node)) {
    return true; // primitive leaf (an identifier's name, a literal's value, ...)
  }
  if (!NAVIGATIONAL_TYPES.has(node.type)) {
    return false;
  }
  // The one allowed filter is equality: refuse a comparator on any other operator.
  if (node.type === "comparator" && node.operator !== "eq") {
    return false;
  }

  return Object.values(node).every(isNavigational);
};

/**
 * Parsing a jsonpath string into its AST is the expensive step, and annotation paths are a
 * small, fixed set that always parse to the same result. So the support check is memoized by
 * normalized path string: the map only grows by the number of distinct annotation paths, and a
 * path's result never changes, so it never needs invalidating. This keeps the per-keystroke
 * cascading work (a form can re-validate every field's paths on every edit) off the parser.
 */
const supportedPathCache = new Map<string, boolean>();

/**
 * Whether `path` is within the supported navigational subset - validate an annotation path
 * with this before relying on `evaluate`. Memoized by normalized path string.
 *
 * @example
 * isSupportedPath("endpoints[?@.name=='ep1'].region") // => true
 * isSupportedPath("items[*].id")                       // => false
 */
export const isSupportedPath = (path: string): boolean => {
  const normalized = normalizePath(path);
  const cached = supportedPathCache.get(normalized);

  if (cached !== undefined) {
    return cached;
  }

  const ast = parse(normalized, { hideExceptions: true });
  const supported = ast !== null && isNavigational(ast);

  supportedPathCache.set(normalized, supported);

  return supported;
};

/**
 * Reads the value at `path` out of `data`, returning `some(value)` only when the path is
 * supported and matches exactly one value; every other case (no/multiple matches,
 * unsupported syntax, parse error) returns `none`.
 *
 * @example
 * evaluate({ a: { b: 1 } }, "a.b") // => some(1)
 */
export const evaluate = (data: unknown, path: string): Maybe.Type<unknown> => {
  const normalized = normalizePath(path);
  if (!isSupportedPath(normalized)) {
    return Maybe.none();
  }

  const result = query(data, normalized, { hideExceptions: true, returnArray: true });
  if (!Array.isArray(result) || result.length !== 1) {
    return Maybe.none();
  }

  return Maybe.some(result[0]);
};

/**
 * The first member segment of a path - the field it reads at the root - or null when the path
 * doesn't start with a member. Used to derive a GraphQL selection field or a reference's
 * source field.
 *
 * @example
 * rootMember("candidate_attributes.name") // => "candidate_attributes"
 * rootMember("[0].id")                     // => null
 */
export const rootMember = (path: string): string | null => {
  const member = path
    .trim()
    .replace(/^\$/, "")
    .replace(/^\./, "")
    .match(/^[A-Za-z_][A-Za-z0-9_]*/);

  return member ? member[0] : null;
};
