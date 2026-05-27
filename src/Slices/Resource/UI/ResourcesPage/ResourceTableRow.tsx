import React, { memo, useMemo, useRef } from "react";
import { Bullseye, Button, Flex, FlexItem, Popover } from "@patternfly/react-core";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import { Resource } from "@/Core";
import { ResourceLink, statusGroupIcons } from "@/UI/Components";
import { words } from "@/UI/words";
import { BlinkingDot } from "./Components";
import { ResourceStateInfo } from "./ResourceStateInfo";

export interface ResourceRow {
  id: string;
  type: string;
  agent: string;
  value: string;
  requiresLength: number;
  status: Resource.ResourceState;
}

// Stable references so memo comparison never fails on these props
const gapNone = { default: "gapNone" as const };
const gapMd = { default: "gapMd" as const };
const noWrap = { default: "nowrap" as const };
const alignCenter = { default: "alignItemsCenter" as const };
const statusCellStyle = { height: "100%", justifySelf: "flex-end" };
const bullseyeStyle = { width: "20px" };
const inlineFlex = { display: "inline-flex" as const };

export const ResourceTableRow: React.FC<{
  row: ResourceRow;
}> = memo(({ row }) => {
  const buttonWrapperRef = useRef<HTMLDivElement>(null);

  // Stable element reference — Popper only diffs bodyContent when row actually changes
  const popoverBody = useMemo(() => <ResourceStateInfo row={row} />, [row]);

  return (
    <Tbody>
      <Tr aria-label="Resource Table Row" isStriped={row.status.isOrphan}>
        <Td dataLabel={words("resources.column.type")} modifier="breakWord">
          {row.type}
        </Td>
        <Td dataLabel={words("resources.column.agent")} modifier="breakWord">
          {row.agent}
        </Td>
        <Td dataLabel={words("resources.column.value")} modifier="breakWord">
          {row.value}
        </Td>
        <Td dataLabel={words("resources.column.status")}>
          <Flex gap={gapNone} flexWrap={noWrap} alignItems={alignCenter} style={statusCellStyle}>
            <Bullseye style={bullseyeStyle}>
              {row.status.isDeploying && <BlinkingDot $size={10} />}
            </Bullseye>

            <Button
              ref={buttonWrapperRef}
              variant="plain"
              aria-label={words("resources.button.statusDetails")}
            >
              <Flex gap={gapMd} flexWrap={noWrap} alignItems={alignCenter}>
                <FlexItem style={inlineFlex}>
                  {statusGroupIcons["blocked"]({
                    state: row.status.blocked,
                    variant: row.status.isOrphan ? "default" : "state",
                  })}
                </FlexItem>
                <FlexItem style={inlineFlex}>
                  {statusGroupIcons["compliance"]({
                    state: row.status.compliance,
                    variant: row.status.isOrphan ? "default" : "state",
                  })}
                </FlexItem>
                <FlexItem style={inlineFlex}>
                  {statusGroupIcons["lastHandlerRun"]({
                    state: row.status.lastHandlerRun,
                    variant: row.status.isOrphan ? "default" : "state",
                  })}
                </FlexItem>
              </Flex>
              <Popover
                triggerRef={buttonWrapperRef}
                triggerAction="click"
                aria-label="Clickable popover"
                position="left"
                headerContent={words("resources.popover.title")}
                bodyContent={popoverBody}
                distance={row.status.isDeploying ? 30 : 20}
              />
            </Button>
          </Flex>
        </Td>
        <Td isActionCell width={10}>
          <ResourceLink resourceId={row.id} linkText={words("resources.link.details")} />
        </Td>
      </Tr>
    </Tbody>
  );
});
