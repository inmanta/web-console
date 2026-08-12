import { parse, query } from "jsonpathly";
import * as Maybe from "@/Core/Language/Maybe";

/**
 * Shared read-only jsonpath evaluator (RFC 9535, via the eval-free `jsonpathly`).
 * Paths arrive as annotation data, so being eval-free removes the injection
 * surface: the other RFC 9535 evaluators considered - `jsonpath-plus` and dchester
 * `jsonpath` - run filter/script expressions through `eval`, so an attacker-supplied
 * path could execute arbitrary code; `jsonpathly` has no such surface by design.
 * Usage is further pinned to the navigational subset (member access, array index,
 * single equality-filter selection), and everything else - wildcards, recursion,
 * slices, unions, functions, non-equality comparisons - is rejected. A leading `$`
 * is optional (`a.b` is read as `$.a.b`).
 */

type AstNode = { type: string; [key: string]: unknown };

const isAstNode = (value: unknown): value is AstNode =>
  typeof value === "object" && value !== null && typeof (value as AstNode).type === "string";

/**
 * jsonpathly needs the RFC 9535 root `$`; authors often omit it
 * (`candidate_attributes.network_name`, `id`), so a missing one is prepended as
 * `$.`. Paths are treated as member-first, so a leading index like `[0]`
 * normalizes to an invalid path and is rejected upstream (fine - projections read
 * into an object node, never a top-level array).
 */
const normalizePath = (path: string): string => {
  const trimmed = path.trim();

  return trimmed.startsWith("$") ? trimmed : `$.${trimmed}`;
};

/**
 * The jsonpathly AST node types that make up plain navigation: the structural
 * spine, member access, array index, and a single equality filter with its literal
 * leaves. This is the exact subset #7013 pins the evaluator to - "member access,
 * array index, equality-filter selection; reject anything beyond navigation".
 *
 * Why only these: a projection has to address exactly one node, and these are the
 * three ways to do that - a member (`a.b`), an array index (`endpoints[0]`), or an
 * equality filter (`endpoints[?@.name=='ep1']`). Everything left out - wildcards,
 * recursion, slices, unions, functions, and non-equality/logical filters - selects
 * a *set* of nodes rather than one, so it cannot target a single value (and
 * `evaluate` rejects a multi-valued result anyway). In particular a slice is not how
 * you reach an embedded-entity element - an index or an equality filter is; and
 * jsonpathly parses those apart (`[0]` is a `bracketMember`, `[0:1]` is a separate
 * `slices` node), so admitting index does not admit slices.
 *
 * It is an allowlist on purpose: `isNavigational` rejects any node type not listed
 * here, so a future jsonpathly construct fails closed rather than slipping through.
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
 * True when `path` is within the supported navigational subset. Use this to
 * validate an annotation-supplied path before relying on `evaluate`.
 */
export const isSupportedPath = (path: string): boolean => {
  const ast = parse(normalizePath(path), { hideExceptions: true });

  return ast !== null && isNavigational(ast);
};

/**
 * Reads the value at `path` out of `data`. Returns `some(value)` only when the
 * path is supported and resolves to exactly one value; every other case (no
 * match, multiple matches, unsupported syntax, parse error) returns `none`.
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
