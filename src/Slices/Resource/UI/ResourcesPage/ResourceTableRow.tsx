import React, { memo, useRef } from "react";
import { useFragment } from "@apollo/client/react";
import { Bullseye, Button, Flex, FlexItem, Popover, Truncate } from "@patternfly/react-core";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import styled, { keyframes } from "styled-components";
import { Resource } from "@/Core";
import { graphql } from "@/Data/Apollo/gql";
import { ResourceLink, statusGroupIcons } from "@/UI/Components";
import { words } from "@/UI/words";
import { BlinkingDot } from "./Components";
import { ResourceStateInfo } from "./ResourceStateInfo";
import type { FragmentType } from "@apollo/client";

export const ResourceTableRow_Fragment = graphql(`
  fragment ResourceTableRow_Fragment on Resource {
    resourceId
    resourceType
    agent
    resourceIdValue
    requiresLength
    state {
      resourceId
      isDeploying
      lastHandlerRun
      compliance
      blocked
      lastHandlerRunAt
      isOrphan
    }
  }
`);

/**
 * A row of the resources table that reads its own fields from the Apollo cache.
 * It only re-renders when the fields of this resource change, not when another row or the page does.
 *
 * @prop {FragmentType<typeof ResourceTableRow_Fragment>} resource - The masked resource from the page query.
 *
 * @example
 * {data.resources.edges.map(({ node }) => <ResourceTableRow key={node.resourceId} resource={node} />)}
 */
export const ResourceTableRow: React.FC<{
  resource: FragmentType<typeof ResourceTableRow_Fragment>;
}> = ({ resource }) => {
  const { data, complete } = useFragment({
    fragment: ResourceTableRow_Fragment,
    from: resource,
  });

  if (!complete) {
    return null;
  }

  return <ResourceTableRowView resource={data} />;
};

/**
 * Presentational row of the resources table.
 *
 * @prop {Resource.Resource} resource - The resource to render.
 */
export const ResourceTableRowView: React.FC<{
  resource: Resource.Resource;
}> = memo(({ resource }) => {
  const buttonWrapperRef = useRef<HTMLDivElement>(null);
  const { state } = resource;
  const variant = state?.isOrphan ? "default" : "state";

  return (
    <Tbody>
      <Tr aria-label="Resource Table Row" isStriped={!!state?.isOrphan}>
        <Td dataLabel={words("type")} modifier="breakWord">
          {resource.resourceType}
        </Td>
        <Td dataLabel={words("agent")} modifier="breakWord">
          {resource.agent}
        </Td>
        <Td dataLabel={words("value")} modifier="breakWord">
          {resource.resourceIdValue}
        </Td>
        <Td dataLabel={words("status")}>
          <Flex
            gap={{ default: "gapNone" }}
            flexWrap={{ default: "nowrap" }}
            alignItems={{ default: "alignItemsCenter" }}
            style={{ height: "100%", justifySelf: "flex-end" }}
          >
            <Bullseye style={{ width: "20px" }}>
              {state?.isDeploying && <BlinkingDot $size={10} />}
            </Bullseye>

            <Button
              ref={buttonWrapperRef}
              variant="plain"
              aria-label={words("resources.button.statusDetails")}
            >
              <Flex
                gap={{ default: "gapMd" }}
                flexWrap={{ default: "nowrap" }}
                alignItems={{ default: "alignItemsCenter" }}
              >
                <FlexItem style={{ display: "inline-flex" }}>
                  {statusGroupIcons["blocked"]({
                    state: Resource.toCompoundState(state?.blocked),
                    variant,
                  })}
                </FlexItem>
                <FlexItem style={{ display: "inline-flex" }}>
                  {statusGroupIcons["compliance"]({
                    state: Resource.toCompoundState(state?.compliance),
                    variant,
                  })}
                </FlexItem>
                <FlexItem style={{ display: "inline-flex" }}>
                  {statusGroupIcons["lastHandlerRun"]({
                    state: Resource.toCompoundState(state?.lastHandlerRun),
                    variant,
                  })}
                </FlexItem>
              </Flex>
              <Popover
                triggerRef={buttonWrapperRef}
                triggerAction="click"
                aria-label="Clickable popover"
                position="left"
                headerContent={words("resources.popover.title")}
                bodyContent={<ResourceStateInfo resource={resource} />}
                distance={state?.isDeploying ? 30 : 20}
              />
            </Button>
          </Flex>
        </Td>
        <Td isActionCell width={10}>
          <ResourceLink resourceId={resource.resourceId} linkText={words("showDetails")} />
        </Td>
      </Tr>
    </Tbody>
  );
});

/**
 * Placeholder text per text column, cycled per row. The lengths are close to real resource ids, so the
 * placeholder wraps over as many lines, and the table sizes its columns the same way, as with real rows.
 */
const ghostLengths = [
  [54, 63, 46],
  [54, 65, 48],
  [54, 64, 47],
];

/** Builds an id-like string of the given length, used as invisible placeholder text. */
const ghostText = (length: number) => "resource-placeholder-".repeat(4).slice(0, length);

/** Delay between the pulse of two consecutive rows, which makes the pulse travel down the table. */
const ROW_DELAY_MS = 120;

const pulse = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
`;

const PulsingRow = styled(Tr)<{ $index: number }>`
  animation: ${pulse} 1.6s ease-in-out infinite;
  animation-delay: ${({ $index }) => ($index % 10) * ROW_DELAY_MS}ms;
`;

/** Invisible text with a placeholder background behind every line it wraps over. */
const GhostText = styled.span`
  color: transparent;
  border-radius: var(--pf-t--global--border--radius--small);
  background-color: var(--pf-t--global--background--color--secondary--default);
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
`;

/** Takes up the space of its invisible children and shows a placeholder bar over them. */
const GhostBox = styled.span`
  position: relative;
  display: inline-block;

  & > * {
    visibility: hidden;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 25% 0;
    border-radius: var(--pf-t--global--border--radius--small);
    background-color: var(--pf-t--global--background--color--secondary--default);
  }
`;

/**
 * Placeholder for a row of the resources table while the page of resources loads. It has the same cells as
 * a real row, placeholder text of about the length of a resource id and the status icons in their neutral
 * color, so the rows and columns stay in place when the data arrives.
 *
 * @prop {number} index - The position of the row, used to stagger the pulse and vary the placeholder lengths.
 *
 * @example
 * {Array.from({ length: 20 }, (_, index) => <ResourceTableRowSkeleton key={index} index={index} />)}
 */
export const ResourceTableRowSkeleton: React.FC<{ index: number }> = ({ index }) => {
  const [typeLength, agentLength, valueLength] = ghostLengths[index % ghostLengths.length];

  return (
    <Tbody aria-hidden>
      <PulsingRow $index={index}>
        <Td dataLabel={words("type")} modifier="breakWord">
          <GhostText>{ghostText(typeLength)}</GhostText>
        </Td>
        <Td dataLabel={words("agent")} modifier="breakWord">
          <GhostText>{ghostText(agentLength)}</GhostText>
        </Td>
        <Td dataLabel={words("value")} modifier="breakWord">
          <GhostText>{ghostText(valueLength)}</GhostText>
        </Td>
        <Td dataLabel={words("status")}>
          <Flex
            gap={{ default: "gapNone" }}
            flexWrap={{ default: "nowrap" }}
            alignItems={{ default: "alignItemsCenter" }}
            style={{ height: "100%", justifySelf: "flex-end" }}
          >
            <Bullseye style={{ width: "20px" }} />
            <Button variant="plain" isDisabled tabIndex={-1}>
              <Flex
                gap={{ default: "gapMd" }}
                flexWrap={{ default: "nowrap" }}
                alignItems={{ default: "alignItemsCenter" }}
              >
                <FlexItem style={{ display: "inline-flex" }}>
                  {statusGroupIcons["blocked"]()}
                </FlexItem>
                <FlexItem style={{ display: "inline-flex" }}>
                  {statusGroupIcons["compliance"]()}
                </FlexItem>
                <FlexItem style={{ display: "inline-flex" }}>
                  {statusGroupIcons["lastHandlerRun"]()}
                </FlexItem>
              </Flex>
            </Button>
          </Flex>
        </Td>
        <Td isActionCell width={10}>
          <GhostBox>
            <Button variant="link" component="span" tabIndex={-1}>
              <Truncate content={words("showDetails")} />
            </Button>
          </GhostBox>
        </Td>
      </PulsingRow>
    </Tbody>
  );
};
