import React from "react";
import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
  HelperText,
  HelperTextItem,
} from "@patternfly/react-core";
import styled from "styled-components";
import { Reference } from "@/Core/Domain";
import { summarize } from "@/Data/Common/References";
import { TextWithCopy } from "@/UI/Components/TextWithCopy";
import { words } from "@/UI/words";
import { ArgumentValue } from "./ArgumentValue";
import { ReferenceChip } from "./ReferenceChip";

// Depth cap: exported data cannot cycle, so this only guards malformed data
// alongside the ancestor check below.
const MAX_DEPTH = 10;

interface Props {
  referenceId: string;
  index: Reference.ReferenceIndex;
  isExpanded: (key: string) => boolean;
  onToggle: (key: string) => () => void;
  depth?: number;
  ancestors?: string[];
  path?: string;
}

// The implicit self `resource` argument always points at the resource on screen,
// so it is dropped; genuine resource arguments (a different name) still render.
const isSelfResourceArg = (arg: Reference.Argument): boolean =>
  arg.kind === "resource" && arg.name === "resource";

/**
 * One reference at any depth: a chip with a chevron, and when expanded a card with
 * its copyable id and one row per argument. A missing id, an ancestor cycle, or the
 * depth cap each render a terminal chip or notice instead of recursing. Expansion is
 * keyed by `path` (its position in the tree, defaulting to the id at the top level), so
 * a node shown in two places opens independently.
 *
 * @prop {string} referenceId - Id of the reference node to render.
 * @prop {Reference.ReferenceIndex} index - Lookup from reference id to normalized node.
 * @prop {(key: string) => boolean} isExpanded - Whether the node at a path is expanded.
 * @prop {(key: string) => () => void} onToggle - Returns the toggle handler for a path.
 * @prop {number} [depth] - Current nesting depth, checked against the depth cap.
 * @prop {string[]} [ancestors] - Reference ids on the path here, for cycle detection.
 * @prop {string} [path] - This node's position in the tree; the expansion key.
 */
export const ReferenceNode: React.FC<Props> = ({
  referenceId,
  index,
  isExpanded,
  onToggle,
  depth = 0,
  ancestors = [],
  path,
}) => {
  const nodePath = path ?? referenceId;
  const node = index[referenceId];

  if (node === undefined) {
    return (
      <ReferenceChip
        label={referenceId}
        color="grey"
        tooltip={words("references.unresolved.tooltip")}
      />
    );
  }

  if (ancestors.includes(referenceId)) {
    return (
      <ReferenceChip
        label={`${summarize(node)} (${words("references.cycle.marker")})`}
        color="orange"
        tooltip={words("references.cycle.tooltip")}
      />
    );
  }

  if (depth >= MAX_DEPTH) {
    return (
      <HelperText>
        <HelperTextItem variant="indeterminate">{words("references.truncated")}</HelperTextItem>
      </HelperText>
    );
  }

  const visibleArgs = node.args.filter((arg) => !isSelfResourceArg(arg));
  const childAncestors = [...ancestors, referenceId];

  const expanded = isExpanded(nodePath);

  // Render the body only while expanded: it avoids building hidden subtrees and
  // sidesteps a PatternFly bug where a collapsed ExpandableSection nested under an
  // expanded one keeps its content in the DOM, spilling as invisible whitespace.
  // The card boundary shows nesting, so a node adds no indent of its own.
  return (
    <ExpandableSection
      toggleContent={<ReferenceChip label={summarize(node)} />}
      toggleAriaLabel={summarize(node)}
      isExpanded={expanded}
      onToggle={onToggle(nodePath)}
    >
      {expanded && (
        <Card isCompact variant="secondary">
          <CardBody>
            <Uuid>
              <TextWithCopy value={node.id} tooltipContent={words("references.uuid.copy")}>
                {node.id}
              </TextWithCopy>
            </Uuid>
            <DescriptionList>
              {visibleArgs.map((arg) => (
                <DescriptionListGroup key={arg.name}>
                  <DescriptionListTerm>{arg.name}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <ArgumentValue
                      argument={arg}
                      index={index}
                      isExpanded={isExpanded}
                      onToggle={onToggle}
                      depth={depth}
                      ancestors={childAncestors}
                      path={nodePath}
                    />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              ))}
            </DescriptionList>
          </CardBody>
        </Card>
      )}
    </ExpandableSection>
  );
};

const Uuid = styled.div`
  font-family: var(--pf-t--global--font--family--mono);
  font-size: var(--pf-t--global--font--size--sm);
  color: var(--pf-t--global--text--color--subtle);
  margin-bottom: var(--pf-t--global--spacer--sm);
`;
