/**
 * ReferenceNode, ArgumentValue and ReplacementList render each other recursively, so they live
 * in one module: split over files, they would import each other in a cycle.
 */
import React from "react";
import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListTerm,
  ExpandableSection,
  Flex,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@inmanta/web-console-core";
import { classifyValue, summarize } from "@inmanta/web-console-core/Common/References";
import { Reference, ResourceDetailsTab } from "@inmanta/web-console-core/Domain";
import { AttributeValue } from "@inmanta/web-console-ui/Components/AttributeList";
import { ResourceLink } from "@inmanta/web-console-ui/Components/ResourceLink";
import { HoverRow, HoverRowGroup } from "@inmanta/web-console-ui/Components/RowHoverReveal";
import { TextWithCopy } from "@inmanta/web-console-ui/Components/TextWithCopy";
import {
  ClassifiedValue,
  factResourceId,
  INLINE_KINDS,
  kindLabel,
  Unresolved,
  WithKindLabel,
} from "./ArgumentValueParts";
import { ReferenceChip } from "./ReferenceChip";

interface ReferenceNodeProps {
  referenceId: string;
  index: Reference.ReferenceIndex;
  isExpanded: (key: string) => boolean;
  onToggle: (key: string) => () => void;
  ancestors?: string[];
  path?: string;
  toggleLabel?: React.ReactNode;
}

// The `resource` argument is the resource on screen, so it is dropped. Other resource
// arguments still render as a link.
const isSelfResourceArg = (arg: Reference.Argument): boolean =>
  arg.kind === "resource" && arg.name === "resource";

/**
 * One reference at any depth: a chip with a chevron, and when expanded a card with
 * its copyable id and one row per argument. A missing id or an ancestor cycle renders
 * a terminal chip instead of recursing, so a cyclic chain still ends. Expansion
 * is keyed by `path` (its position in the tree, defaulting to the id at the top level),
 * so a node shown in two places opens independently.
 *
 * @prop {string} referenceId - Id of the reference node to render.
 * @prop {Reference.ReferenceIndex} index - Lookup from reference id to normalized node.
 * @prop {(key: string) => boolean} isExpanded - Whether the node at a path is expanded.
 * @prop {(key: string) => () => void} onToggle - Returns the toggle handler for a path.
 * @prop {string[]} [ancestors] - Reference ids on the path here, for cycle detection.
 * @prop {string} [path] - This node's position in the tree; the expansion key.
 * @prop {React.ReactNode} [toggleLabel] - Shown next to the chip in the toggle.
 */
export const ReferenceNode: React.FC<ReferenceNodeProps> = ({
  referenceId,
  index,
  isExpanded,
  onToggle,
  ancestors = [],
  path,
  toggleLabel,
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

  const visibleArgs = node.args.filter((arg) => !isSelfResourceArg(arg));
  const childAncestors = [...ancestors, referenceId];

  const expanded = isExpanded(nodePath);

  // Render the body only while expanded: it avoids building hidden subtrees and
  // sidesteps a PatternFly bug where a collapsed ExpandableSection nested under an
  // expanded one keeps its content in the DOM, spilling as invisible whitespace.
  // The card boundary shows nesting, so a node adds no indent of its own.
  return (
    <ExpandableSection
      toggleContent={
        <Flex
          display={{ default: "inlineFlex" }}
          gap={{ default: "gapSm" }}
          alignItems={{ default: "alignItemsCenter" }}
        >
          <ReferenceChip label={summarize(node)} />
          {toggleLabel}
        </Flex>
      }
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
                <HoverRowGroup key={arg.name}>
                  <DescriptionListTerm>{arg.name}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <ArgumentValue
                      argument={arg}
                      referenceType={node.type}
                      index={index}
                      isExpanded={isExpanded}
                      onToggle={onToggle}
                      ancestors={childAncestors}
                      path={nodePath}
                    />
                  </DescriptionListDescription>
                </HoverRowGroup>
              ))}
            </DescriptionList>
          </CardBody>
        </Card>
      )}
    </ExpandableSection>
  );
};

interface ArgumentValueProps {
  argument: Reference.Argument;
  referenceType: string;
  index: Reference.ReferenceIndex;
  isExpanded: (key: string) => boolean;
  onToggle: (key: string) => () => void;
  ancestors: string[];
  path: string;
}

/**
 * Renders one normalized argument by its kind: literal/json through the shared
 * attribute pipeline, a reference as an expandable child node, mjson with its
 * replacements under it, a resource as a link, python_type/get as text, and unknown
 * from its raw payload. A fact reference's `resource_id` links to that resource's
 * Facts tab. Inline values carry a kind label behind them, a reference carries it
 * in its toggle, and a code editor gets none. Child nodes extend `path` with the
 * argument name so their expansion is per occurrence.
 *
 * @prop {Reference.Argument} argument - The normalized argument to render.
 * @prop {string} referenceType - The type of the reference that owns the argument.
 * @prop {Reference.ReferenceIndex} index - Lookup from reference id to normalized node.
 * @prop {(key: string) => boolean} isExpanded - Whether the node at a path is expanded.
 * @prop {(key: string) => () => void} onToggle - Returns the toggle handler for a path.
 * @prop {string[]} ancestors - Reference ids on the path here, for cycle detection.
 * @prop {string} path - The owning node's path, extended for child nodes.
 */
const ArgumentValue: React.FC<ArgumentValueProps> = ({
  argument,
  referenceType,
  index,
  isExpanded,
  onToggle,
  ancestors,
  path,
}) => {
  const label = kindLabel(argument);

  switch (argument.kind) {
    case "literal":
    case "json": {
      const factResource = factResourceId(referenceType, argument);

      if (factResource !== undefined) {
        return (
          <WithKindLabel label={words("references.argumentKind.resource")}>
            <ResourceLink resourceId={factResource} tab={ResourceDetailsTab.Facts} />
          </WithKindLabel>
        );
      }

      return (
        <ClassifiedValue attribute={classifyValue(argument.name, argument.value)} label={label} />
      );
    }

    case "mjson":
      return (
        <Stack hasGutter>
          <StackItem>
            <HoverRow>
              <ClassifiedValue
                attribute={classifyValue(argument.name, argument.value)}
                label={label}
              />
            </HoverRow>
          </StackItem>
          <StackItem>
            <ReplacementList
              replacements={argument.replacements}
              index={index}
              isExpanded={isExpanded}
              onToggle={onToggle}
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
          ancestors={ancestors}
          path={`${path}/${argument.name}`}
          toggleLabel={<Label isCompact>{label}</Label>}
        />
      );

    case "resource":
      return (
        <WithKindLabel label={label}>
          <ResourceLink resourceId={argument.resourceId} />
        </WithKindLabel>
      );

    case "python_type":
      return (
        <WithKindLabel label={label}>
          <code>{argument.value}</code>
        </WithKindLabel>
      );

    case "get":
      return (
        <WithKindLabel label={label}>
          <code>
            {argument.expression} <Unresolved>({words("references.unresolved.marker")})</Unresolved>
          </code>
        </WithKindLabel>
      );

    case "unknown": {
      // The label is the only place an unknown kind's type name shows, so it is
      // kept even above a code editor.
      const attribute = classifyValue(argument.name, argument.raw);

      if (INLINE_KINDS.includes(attribute.kind)) {
        return <ClassifiedValue attribute={attribute} label={label} />;
      }

      return (
        <Stack hasGutter>
          <StackItem>
            <Label isCompact>{label}</Label>
          </StackItem>
          <StackItem>
            <AttributeValue attribute={attribute} />
          </StackItem>
        </Stack>
      );
    }
  }
};

interface ReplacementListProps {
  replacements: Reference.Replacement[];
  index: Reference.ReferenceIndex;
  isExpanded: (key: string) => boolean;
  onToggle: (key: string) => () => void;
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
 * @prop {string[]} ancestors - Reference ids on the path here, for cycle detection.
 * @prop {string} parentPath - The owning attribute or argument's path, extended per row.
 */
export const ReplacementList: React.FC<ReplacementListProps> = ({
  replacements,
  index,
  isExpanded,
  onToggle,
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

const Uuid = styled(HoverRow)`
  font-family: var(--pf-t--global--font--family--mono);
  font-size: var(--pf-t--global--font--size--sm);
  color: var(--pf-t--global--text--color--subtle);
  margin-bottom: var(--pf-t--global--spacer--sm);
`;
