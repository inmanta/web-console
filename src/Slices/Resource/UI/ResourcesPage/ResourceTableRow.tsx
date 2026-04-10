import { useRef } from "react";
import { Content, Flex, FlexItem, Popover, capitalize } from "@patternfly/react-core";
import { ClockIcon, CubesIcon } from "@patternfly/react-icons";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import { t_global_icon_size_font_xl } from "@patternfly/react-tokens";
import styled from "styled-components";
import { Resource } from "@/Core";
import { DeployingDot, ResourceLink, statusGroupIcons } from "@/UI/Components";
import { words } from "@/UI/words";

/** Orphans are not actively a part of the latest intent anymore so limited information is displayed for them. */
const PopoverContent = ({ row }: { row: Resource.Row }) => {
  if (row.status.isOrphan) {
    return (
      <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
        <FlexItem style={{ display: "inline-flex" }}>
          <ClockIcon
            style={{
              width: t_global_icon_size_font_xl.value,
              height: t_global_icon_size_font_xl.value,
            }}
          />
        </FlexItem>
        <Content component="p">
          {words("resources.popover.lastDeployed")(row.status.lastHandlerRunAt)}
        </Content>
      </Flex>
    );
  }

  return (
    <Flex direction={{ default: "column" }} gap={{ default: "gapMd" }}>
      <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
        <FlexItem style={{ display: "inline-flex" }}>
          {statusGroupIcons["blocked"]({ state: row.status.blocked })}
        </FlexItem>
        <Content component="p">
          {capitalize(row.status.blocked.toLowerCase().replace(/_/g, " "))}
        </Content>
      </Flex>
      <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
        <FlexItem style={{ display: "inline-flex" }}>
          {statusGroupIcons["compliance"]({ state: row.status.compliance })}
        </FlexItem>
        <Content component="p">
          {capitalize(row.status.compliance.toLowerCase().replace(/_/g, " "))}
        </Content>
      </Flex>
      <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
        <FlexItem style={{ display: "inline-flex" }}>
          {statusGroupIcons["lastHandlerRun"]({ state: row.status.lastHandlerRun })}
        </FlexItem>
        <Content component="p">
          {capitalize(row.status.lastHandlerRun.toLowerCase().replace(/_/g, " "))}
        </Content>
      </Flex>
      <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
        <FlexItem style={{ display: "inline-flex" }}>
          <ClockIcon
            style={{
              width: t_global_icon_size_font_xl.value,
              height: t_global_icon_size_font_xl.value,
            }}
          />
        </FlexItem>
        <Content component="p">
          {words("resources.popover.lastDeployed")(row.status.lastHandlerRunAt)}
        </Content>
      </Flex>
      <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
        <FlexItem style={{ display: "inline-flex" }}>
          <CubesIcon
            style={{
              width: t_global_icon_size_font_xl.value,
              height: t_global_icon_size_font_xl.value,
            }}
          />
        </FlexItem>
        <Content component="p">
          {row.requiresLength}{" "}
          {row.requiresLength === 1
            ? words("resources.popover.requirement")
            : words("resources.popover.requirements")}
        </Content>
      </Flex>
      {row.status.isDeploying && (
        <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
          <FlexItem style={{ paddingLeft: "5px", width: "15px", height: "15px" }}>
            <DeployingDot />
          </FlexItem>
          <Content component="p">{words("resources.popover.deploying")}</Content>
        </Flex>
      )}
    </Flex>
  );
};

export const ResourceTableRow: React.FC<{
  row: Resource.Row;
  isLastRow: boolean;
}> = ({ row, isLastRow }) => {
  const flexRef = useRef<HTMLDivElement>(null);
  return (
    <Tbody>
      <Tr aria-label="Resource Table Row" {...(isLastRow && { style: { borderBottom: "none" } })}>
        <Td dataLabel={words("resources.column.type")} modifier="breakWord">
          {row.type}
        </Td>
        <Td dataLabel={words("resources.column.agent")} modifier="breakWord">
          {row.agent}
        </Td>
        <Td dataLabel={words("resources.column.value")} modifier="breakWord">
          {row.value}
        </Td>
        <StyledTD dataLabel={words("resources.column.status")}>
          <StyledFlex
            ref={flexRef}
            gap={{ default: "gapMd" }}
            flexWrap={{ default: "nowrap" }}
            alignItems={{ default: "alignItemsCenter" }}
          >
            {/* Don't show deploying dot whenever resource is orphan */}
            {row.status.isDeploying && !row.status.isOrphan && (
              <FlexItem
                style={{
                  display: "flex",
                  width: "20px",
                  height: "20px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DeployingDot />
              </FlexItem>
            )}
            <FlexItem style={{ display: "inline-flex" }}>
              {statusGroupIcons["blocked"]({
                state: row.status.blocked,
                // We override color because whenever orphan we just show gray icons
                overrideColor: row.status.isOrphan ? "var(--pf-t--color--gray--60)" : undefined,
              })}
            </FlexItem>
            <FlexItem style={{ display: "inline-flex" }}>
              {statusGroupIcons["compliance"]({
                state: row.status.compliance,
                overrideColor: row.status.isOrphan ? "var(--pf-t--color--gray--60)" : undefined,
              })}
            </FlexItem>
            <FlexItem style={{ display: "inline-flex" }}>
              {statusGroupIcons["lastHandlerRun"]({
                state: row.status.lastHandlerRun,
                overrideColor: row.status.isOrphan ? "var(--pf-t--color--gray--60)" : undefined,
              })}
            </FlexItem>
            <Popover
              triggerRef={flexRef}
              triggerAction="click"
              aria-label="Hoverable popover"
              position="left"
              headerContent={words("resources.popover.title")}
              bodyContent={<PopoverContent row={row} />}
            />
          </StyledFlex>
        </StyledTD>
        <Td isActionCell width={10}>
          <ResourceLink resourceId={row.id} linkText={words("resources.link.details")} />
        </Td>
      </Tr>
    </Tbody>
  );
};

const StyledTD = styled(Td)`
  /* Removes padding from cell and moves it to the Flex */
  padding-block: 0 !important;
  padding-inline: 0 !important;
  /* This is a hack to be able to set the childs height to 100% */
  height: 1px;
`;

const StyledFlex = styled(Flex)`
  height: 100%;
  padding-inline: var(--pf-t--global--spacer--md);
  padding-block: var(--pf-t--global--spacer--md);
  cursor: pointer;
  justify-self: flex-end;
  border-radius: 4px;
  transition: background 0.3s ease;
  &:hover {
    background: var(--pf-t--global--background--color--primary--hover);
  }
`;
