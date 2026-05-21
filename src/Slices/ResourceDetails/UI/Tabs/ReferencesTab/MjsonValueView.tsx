import React from "react";
import { Label } from "@patternfly/react-core";
import styled from "styled-components";
import { MjsonArg } from "@S/ResourceDetails/Core/Reference";

interface Props {
  arg: MjsonArg;
  onNavigateToReference: (id: string) => void;
}

const SENTINEL_PREFIX = "@@INMANTA_REF_START@@";
const SENTINEL_SUFFIX = "@@INMANTA_REF_END@@";
const SENTINEL_PATTERN = new RegExp(
  `"${SENTINEL_PREFIX}([0-9a-fA-F-]+)${SENTINEL_SUFFIX}"`,
  "g"
);

const CodeBlock = styled.pre`
  margin: 0;
  padding: 12px;
  border-radius: 4px;
  background: var(--pf-t--global--background--color--secondary--default, #f5f5f5);
  font-family: var(--pf-t--global--font--family--mono, monospace);
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

const InlineLabel = styled(Label)`
  vertical-align: middle;
  margin: 0 2px;
`;

type PathToken = string | number;

const parseJsonPath = (path: string): PathToken[] => {
  const tokens: PathToken[] = [];
  let i = path.startsWith("$") ? 1 : 0;

  while (i < path.length) {
    const ch = path[i];

    if (ch === "[") {
      const end = path.indexOf("]", i);

      if (end === -1) {
        break;
      }
      const inner = path.slice(i + 1, end).trim();

      if (/^-?\d+$/.test(inner)) {
        tokens.push(Number(inner));
      } else {
        tokens.push(inner.replace(/^["']|["']$/g, ""));
      }
      i = end + 1;
    } else if (ch === ".") {
      i += 1;
      const start = i;

      while (i < path.length && path[i] !== "." && path[i] !== "[") {
        i += 1;
      }
      tokens.push(path.slice(start, i));
    } else {
      i += 1;
    }
  }

  return tokens;
};

const setAtPath = (root: unknown, path: string, value: unknown): unknown => {
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

const deepClone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const buildSubstituted = (arg: MjsonArg): string => {
  const references = arg.references ?? {};
  let working: unknown = deepClone(arg.value);

  for (const [path, ref] of Object.entries(references)) {
    const sentinel = `${SENTINEL_PREFIX}${ref.id}${SENTINEL_SUFFIX}`;
    const tokens = parseJsonPath(path);

    if (tokens.length === 0) {
      working = sentinel;
      continue;
    }
    working = setAtPath(working, path, sentinel);
  }

  return JSON.stringify(working, null, 2);
};

/**
 * Renders the value of an `mjson` arg. Reference placeholders carried in
 * `arg.references` are substituted at their JSON path and rendered as
 * clickable labels inline in the JSON text.
 */
export const MjsonValueView: React.FC<Props> = ({ arg, onNavigateToReference }) => {
  if (!arg.references || Object.keys(arg.references).length === 0) {
    return <CodeBlock>{JSON.stringify(arg.value, null, 2)}</CodeBlock>;
  }

  const json = buildSubstituted(arg);
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  SENTINEL_PATTERN.lastIndex = 0;
  while ((match = SENTINEL_PATTERN.exec(json)) !== null) {
    if (match.index > lastIndex) {
      parts.push(json.slice(lastIndex, match.index));
    }
    const refId = match[1];

    parts.push(
      <InlineLabel
        key={`ref-${key}`}
        color="blue"
        isCompact
        onClick={() => onNavigateToReference(refId)}
      >
        → {refId}
      </InlineLabel>
    );
    key += 1;
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < json.length) {
    parts.push(json.slice(lastIndex));
  }

  return <CodeBlock>{parts}</CodeBlock>;
};
