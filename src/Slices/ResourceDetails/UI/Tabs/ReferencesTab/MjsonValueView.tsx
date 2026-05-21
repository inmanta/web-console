import React from "react";
import styled from "styled-components";
import { MjsonArg } from "@S/ResourceDetails/Core/Reference";
import {
  QUOTED_SENTINEL_PATTERN,
  splitWithChips,
  substituteReferences,
} from "./sentinel";

interface Props {
  arg: MjsonArg;
  onNavigateToReference: (id: string) => void;
  getReferenceType: (id: string) => string | undefined;
}

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

/**
 * Renders the value of an `mjson` arg. Reference placeholders carried in
 * `arg.references` are substituted at their JSON path and rendered as
 * clickable labels inline in the JSON text.
 */
export const MjsonValueView: React.FC<Props> = ({
  arg,
  onNavigateToReference,
  getReferenceType,
}) => {
  const references = arg.references ?? {};

  if (Object.keys(references).length === 0) {
    return <CodeBlock>{JSON.stringify(arg.value, null, 2)}</CodeBlock>;
  }

  const pathToId = Object.fromEntries(
    Object.entries(references).map(([path, ref]) => [path, ref.id])
  );
  const substituted = substituteReferences(arg.value, pathToId);
  const json = JSON.stringify(substituted, null, 2);

  return (
    <CodeBlock>
      {splitWithChips({
        text: json,
        pattern: QUOTED_SENTINEL_PATTERN,
        onNavigateToReference,
        getReferenceType,
      })}
    </CodeBlock>
  );
};
