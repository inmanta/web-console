import { useRef } from "react";
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

export const ResourceTableRow: React.FC<{
  row: ResourceRow;
}> = ({ row }) => {
  const buttonWrapperRef = useRef<HTMLDivElement>(null);

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
          <Flex
            gap={{ default: "gapNone" }}
            flexWrap={{ default: "nowrap" }}
            alignItems={{ default: "alignItemsCenter" }}
            style={{
              height: "100%",
              justifySelf: "flex-end",
            }}
          >
            <Bullseye style={{ width: "20px" }}>
              {row.status.isDeploying && <BlinkingDot $size={10} />}
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
                    state: row.status.blocked,
                    variant: row.status.isOrphan ? "default" : "state",
                  })}
                </FlexItem>
                <FlexItem style={{ display: "inline-flex" }}>
                  {statusGroupIcons["compliance"]({
                    state: row.status.compliance,
                    variant: row.status.isOrphan ? "default" : "state",
                  })}
                </FlexItem>
                <FlexItem style={{ display: "inline-flex" }}>
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
                bodyContent={<ResourceStateInfo row={row} />}
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
};
