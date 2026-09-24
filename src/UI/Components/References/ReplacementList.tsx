import React from "react";
import { Stack, StackItem } from "@patternfly/react-core";
import styled from "styled-components";
import { Reference } from "@/Core/Domain";
import { ReferenceNode } from "./ReferenceNode";

interface Props {
  replacements: Reference.Replacement[];
  index: Reference.ReferenceIndex;
  isExpanded: (key: string) => boolean;
  onToggle: (key: string) => () => void;
  depth: number;
  ancestors: string[];
  parentPath: string;
}

/**
 * Lists the replacements under a kept value: one row per destination, naming the
 * jsonpath it fills and the reference node that fills it. Each row extends `parentPath`
 * with its destination so a node reused across rows keeps its own expansion state.
 *
 * @prop {Reference.Replacement[]} replacements - The replacements to list, one per row.
 * @prop {Reference.ReferenceIndex} index - Lookup from reference id to normalized node.
 * @prop {(key: string) => boolean} isExpanded - Whether the node at a path is expanded.
 * @prop {(key: string) => () => void} onToggle - Returns the toggle handler for a path.
 * @prop {number} depth - Depth of the listed nodes, checked against the depth cap.
 * @prop {string[]} ancestors - Reference ids on the path here, for cycle detection.
 * @prop {string} parentPath - The owning attribute or argument's path, extended per row.
 */
export const ReplacementList: React.FC<Props> = ({
  replacements,
  index,
  isExpanded,
  onToggle,
  depth,
  ancestors,
  parentPath,
}) => (
  <Stack hasGutter>
    {replacements.map((replacement) => (
      <StackItem key={replacement.destination}>
        <Destination>{replacement.destination}</Destination>
        <ReferenceNode
          referenceId={replacement.referenceId}
          index={index}
          isExpanded={isExpanded}
          onToggle={onToggle}
          depth={depth}
          ancestors={ancestors}
          path={`${parentPath}/${replacement.destination}`}
        />
      </StackItem>
    ))}
  </Stack>
);

const Destination = styled.div`
  font-family: var(--pf-t--global--font--family--mono);
  font-size: var(--pf-t--global--font--size--sm);
  color: var(--pf-t--global--text--color--subtle);
`;
