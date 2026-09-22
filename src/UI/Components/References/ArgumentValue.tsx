import React from "react";
import { Stack, StackItem } from "@patternfly/react-core";
import styled from "styled-components";
import { Reference } from "@/Core/Domain";
import { classifyValue } from "@/Data/Common/References/classifyValue";
import { AttributeValue } from "@/UI/Components/AttributeList";
import { ResourceLink } from "@/UI/Components/ResourceLink";
import { words } from "@/UI/words";
import { ReferenceNode } from "./ReferenceNode";
import { ReplacementList } from "./ReplacementList";

interface Props {
  argument: Reference.Argument;
  index: Reference.ReferenceIndex;
  isExpanded: (key: string) => boolean;
  onToggle: (key: string) => () => void;
  depth: number;
  ancestors: string[];
  path: string;
}

/**
 * Renders one normalized argument by its kind: literal/json through the shared
 * attribute pipeline, a reference as an expandable child node, mjson with its
 * replacements under it, a resource as a link, and python_type/get/unknown as text.
 * Child nodes extend `path` with the argument name so their expansion is per occurrence.
 *
 * @prop {Reference.Argument} argument - The normalized argument to render.
 * @prop {Reference.ReferenceIndex} index - Lookup from reference id to normalized node.
 * @prop {(key: string) => boolean} isExpanded - Whether the node at a path is expanded.
 * @prop {(key: string) => () => void} onToggle - Returns the toggle handler for a path.
 * @prop {number} depth - Current nesting depth, checked against the depth cap.
 * @prop {string[]} ancestors - Reference ids on the path here, for cycle detection.
 * @prop {string} path - The owning node's path, extended for child nodes.
 */
export const ArgumentValue: React.FC<Props> = ({
  argument,
  index,
  isExpanded,
  onToggle,
  depth,
  ancestors,
  path,
}) => {
  switch (argument.kind) {
    case "literal":
    case "json":
      return <AttributeValue attribute={classifyValue(argument.name, argument.value)} />;

    case "mjson":
      return (
        <Stack hasGutter>
          <StackItem>
            <AttributeValue attribute={classifyValue(argument.name, argument.value)} />
          </StackItem>
          <StackItem>
            <ReplacementList
              replacements={argument.replacements}
              index={index}
              isExpanded={isExpanded}
              onToggle={onToggle}
              depth={depth}
              ancestors={ancestors}
              parentPath={`${path}/${argument.name}`}
            />
          </StackItem>
        </Stack>
      );

    case "reference":
      return (
        <ReferenceNode
          referenceId={argument.referenceId}
          index={index}
          isExpanded={isExpanded}
          onToggle={onToggle}
          depth={depth + 1}
          ancestors={ancestors}
          path={`${path}/${argument.name}`}
        />
      );

    case "resource":
      return <ResourceLink resourceId={argument.resourceId} />;

    case "python_type":
      return <code>{argument.value}</code>;

    case "get":
      return (
        <code>
          {argument.expression} <Unresolved>({words("references.unresolved.marker")})</Unresolved>
        </code>
      );

    case "unknown":
      return (
        <>
          <code>{argument.type}</code>
          <AttributeValue attribute={classifyValue(argument.name, argument.raw)} />
        </>
      );
  }
};

const Unresolved = styled.span`
  color: var(--pf-t--global--text--color--subtle);
`;
