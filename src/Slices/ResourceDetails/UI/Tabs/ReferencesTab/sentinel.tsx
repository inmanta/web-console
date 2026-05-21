import React from "react";
import { Label } from "@patternfly/react-core";
import styled from "styled-components";

/**
 * Shared utilities for embedding clickable reference chips inside textual
 * representations of values. The same trick is used both for `mjson` reference
 * arguments and for desired-state attributes that are produced by mutators.
 *
 * The idea: walk the value, replace each "hole" (identified by a JSONPath)
 * with a printable sentinel string carrying the reference id, then serialize
 * the result and split the resulting text on the sentinel pattern. Each
 * sentinel becomes a `<Label>` chip; the rest of the text is rendered as-is.
 *
 * Printable ASCII sentinels are required because `JSON.stringify` escapes
 * non-printable characters into 6-char `\uXXXX` sequences, which would break
 * the regex.
 */
export const SENTINEL_PREFIX = "@@INMANTA_REF_START@@";
export const SENTINEL_SUFFIX = "@@INMANTA_REF_END@@";
const ID_PATTERN = "[0-9a-fA-F-]+";

/** Matches a sentinel surrounded by JSON string quotes. */
export const QUOTED_SENTINEL_PATTERN = new RegExp(
  `"${SENTINEL_PREFIX}(${ID_PATTERN})${SENTINEL_SUFFIX}"`,
  "g"
);

/** Matches a sentinel embedded in plain text (no surrounding quotes). */
export const RAW_SENTINEL_PATTERN = new RegExp(
  `${SENTINEL_PREFIX}(${ID_PATTERN})${SENTINEL_SUFFIX}`,
  "g"
);

export const sentinelFor = (refId: string): string =>
  `${SENTINEL_PREFIX}${refId}${SENTINEL_SUFFIX}`;

type PathToken = string | number;

/**
 * Minimal JSONPath parser. Handles `$` root, `[<n>]` index, `[<"key">]` key,
 * and `.key`. Filters, wildcards, recursive descent, slices and unions are
 * out of scope.
 */
export const parseJsonPath = (path: string): PathToken[] => {
  const tokens: PathToken[] = [];
  const normalized =
    path.startsWith("$") || path.startsWith("[") || path.startsWith(".")
      ? path
      : `$.${path}`;
  let i = normalized.startsWith("$") ? 1 : 0;

  while (i < normalized.length) {
    const ch = normalized[i];

    if (ch === "[") {
      const end = normalized.indexOf("]", i);

      if (end === -1) {
        break;
      }
      const inner = normalized.slice(i + 1, end).trim();

      if (/^-?\d+$/.test(inner)) {
        tokens.push(Number(inner));
      } else {
        tokens.push(inner.replace(/^["']|["']$/g, ""));
      }
      i = end + 1;
    } else if (ch === ".") {
      i += 1;
      const start = i;

      while (i < normalized.length && normalized[i] !== "." && normalized[i] !== "[") {
        i += 1;
      }
      tokens.push(normalized.slice(start, i));
    } else {
      i += 1;
    }
  }

  return tokens;
};

/**
 * Writes `value` at `path` inside `root`. Returns the (possibly replaced)
 * root. If the path has no tokens (root itself), `value` is returned
 * directly. If the path navigates through a non-object intermediate, the
 * original root is returned unchanged.
 */
export const setAtPath = (root: unknown, path: string, value: unknown): unknown => {
  const tokens = parseJsonPath(path);

  if (tokens.length === 0) {
    return value;
  }

  let cur: Record<PathToken, unknown> = root as Record<PathToken, unknown>;

  for (let i = 0; i < tokens.length - 1; i += 1) {
    const next = cur[tokens[i]];

    if (next === null || typeof next !== "object") {
      return root;
    }
    cur = next as Record<PathToken, unknown>;
  }
  cur[tokens[tokens.length - 1]] = value;

  return root;
};

export const deepCloneJson = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

/**
 * Substitutes sentinels for every `(path, refId)` entry. Returns the mutated
 * (cloned) value; if the entire root is replaced (empty path), the sentinel
 * string itself is returned.
 */
export const substituteReferences = (
  value: unknown,
  references: Record<string, string>
): unknown => {
  let working: unknown = deepCloneJson(value);

  for (const [path, refId] of Object.entries(references)) {
    const sentinel = sentinelFor(refId);
    const tokens = parseJsonPath(path);

    if (tokens.length === 0) {
      working = sentinel;
      continue;
    }
    working = setAtPath(working, path, sentinel);
  }

  return working;
};

const InlineLabel = styled(Label)`
  vertical-align: middle;
  margin: 0 2px;
`;

interface ChipFactoryProps {
  refId: string;
  onNavigateToReference: (id: string) => void;
  getReferenceType: (id: string) => string | undefined;
  keyHint: string | number;
}

export const ReferenceChip: React.FC<ChipFactoryProps> = ({
  refId,
  onNavigateToReference,
  getReferenceType,
  keyHint,
}) => (
  <InlineLabel
    key={`ref-${keyHint}`}
    color="blue"
    isCompact
    onClick={() => onNavigateToReference(refId)}
  >
    {getReferenceType(refId) ?? "reference"} · {refId}
  </InlineLabel>
);

interface SplitOptions {
  text: string;
  pattern: RegExp;
  onNavigateToReference: (id: string) => void;
  getReferenceType: (id: string) => string | undefined;
}

/**
 * Splits a text on sentinel matches and returns an array of React nodes:
 * text chunks alternating with `<ReferenceChip>` for each match. Resets the
 * regex's `lastIndex` before scanning so the function is safe to call
 * repeatedly with the same shared pattern object.
 */
export const splitWithChips = ({
  text,
  pattern,
  onNavigateToReference,
  getReferenceType,
}: SplitOptions): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  pattern.lastIndex = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <ReferenceChip
        key={`chip-${key}`}
        refId={match[1]}
        onNavigateToReference={onNavigateToReference}
        getReferenceType={getReferenceType}
        keyHint={key}
      />
    );
    key += 1;
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};
