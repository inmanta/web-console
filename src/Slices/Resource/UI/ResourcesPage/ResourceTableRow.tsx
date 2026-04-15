import { useRef } from "react";
import { Content, Flex, FlexItem, Popover, Icon } from "@patternfly/react-core";
import { ClockIcon, CubesIcon, UnlinkIcon } from "@patternfly/react-icons";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import styled from "styled-components";
import { Resource } from "@/Core";
import { DateWithTooltip, ResourceLink, statusGroupIcons, statusMapping } from "@/UI/Components";
import { words } from "@/UI/words";
import { CompileReportsIndication } from "./Components";

const PopoverRow: React.FC<{
  icon: React.ReactNode;
  text: React.ReactNode;
}> = ({ icon, text }) => (
  <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
    <FlexItem style={{ display: "inline-flex" }}>{icon}</FlexItem>
    <Content component="p">{text}</Content>
  </Flex>
);

/** Orphans are not actively a part of the latest intent anymore so limited information is displayed for them. */
const PopoverContent = ({ row }: { row: Resource.Row }) => {
  if (row.status.isOrphan) {
    return (
      <Flex direction={{ default: "column" }}>
        <PopoverRow
          icon={
            <Icon size="heading_2xl">
              <UnlinkIcon />
            </Icon>
          }
          text={words("resources.popover.orphan")}
        />

        <PopoverRow
          icon={
            <Icon size="heading_2xl">
              <ClockIcon />
            </Icon>
          }
          text={
            <>
              {words("resources.popover.lastDeployed")}
              <DateWithTooltip timestamp={row.status.lastHandlerRunAt || ""} isFull />
            </>
          }
        />
      </Flex>
    );
  }

  return (
    <Flex direction={{ default: "column" }} gap={{ default: "gapMd" }}>
      <PopoverRow
        icon={statusGroupIcons["blocked"]({ state: row.status.blocked })}
        text={statusMapping[row.status.blocked]}
      />

      <PopoverRow
        icon={statusGroupIcons["compliance"]({ state: row.status.compliance })}
        text={statusMapping[row.status.compliance]}
      />

      <PopoverRow
        icon={statusGroupIcons["lastHandlerRun"]({ state: row.status.lastHandlerRun })}
        text={statusMapping[row.status.lastHandlerRun]}
      />

      <PopoverRow
        icon={
          <Icon size="heading_2xl">
            <ClockIcon />
          </Icon>
        }
        text={
          <>
            {words("resources.popover.lastDeployed")}
            <DateWithTooltip timestamp={row.status.lastHandlerRunAt || ""} isFull />
          </>
        }
      />

      <PopoverRow
        icon={
          <Icon size="heading_2xl">
            <CubesIcon />
          </Icon>
        }
        text={
          <>
            {row.requiresLength}{" "}
            {row.requiresLength === 1
              ? words("resources.popover.requirement")
              : words("resources.popover.requirements")}
          </>
        }
      />

      {row.status.isDeploying && (
        <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
          <FlexItem style={{ margin: "0px 5px", display: "inline-flex" }}>
            <CompileReportsIndication $size={10} />
          </FlexItem>
          <Content component="p">{words("resources.popover.deploying")}</Content>
        </Flex>
      )}
    </Flex>
  );
};

export const ResourceTableRow: React.FC<{
  row: Resource.Row;
}> = ({ row }) => {
  const iconsWrapperRef = useRef<HTMLDivElement>(null);
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
        <StyledTD dataLabel={words("resources.column.status")}>
          <Flex
            gap={{ default: "gapNone" }}
            flexWrap={{ default: "nowrap" }}
            alignItems={{ default: "alignItemsCenter" }}
            style={{
              height: "100%",
              justifySelf: "flex-end",
            }}
          >
            <FlexItem
              style={{
                display: "flex",
                width: "20px",
                height: "20px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Don't show deploying dot whenever resource is orphan */}
              {row.status.isDeploying && <CompileReportsIndication $size={10} />}
            </FlexItem>
            <IconsWrapper
              ref={iconsWrapperRef}
              gap={{ default: "gapMd" }}
              flexWrap={{ default: "nowrap" }}
              alignItems={{ default: "alignItemsCenter" }}
              $isOrphan={row.status.isOrphan}
            >
              <FlexItem style={{ display: "inline-flex" }}>
                {statusGroupIcons["blocked"]({
                  state: row.status.blocked,
                  variant: row.status.isOrphan ? "disabled" : undefined,
                })}
              </FlexItem>
              <FlexItem style={{ display: "inline-flex" }}>
                {statusGroupIcons["compliance"]({
                  state: row.status.compliance,
                  variant: row.status.isOrphan ? "disabled" : undefined,
                })}
              </FlexItem>
              <FlexItem style={{ display: "inline-flex" }}>
                {statusGroupIcons["lastHandlerRun"]({
                  state: row.status.lastHandlerRun,
                  variant: row.status.isOrphan ? "disabled" : undefined,
                })}
              </FlexItem>
              <Popover
                triggerRef={iconsWrapperRef}
                triggerAction="click"
                aria-label="Clickable popover"
                position="left"
                headerContent={words("resources.popover.title")}
                bodyContent={<PopoverContent row={row} />}
                distance={row.status.isDeploying ? 30 : 20}
              />
            </IconsWrapper>
          </Flex>
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

const IconsWrapper = styled(Flex)<{ $isOrphan?: boolean }>`
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s ease;
  height: 100%;
  padding-inline: var(--pf-t--global--spacer--md);
  padding-block: var(--pf-t--global--spacer--md);

  /* Only non-orphan resources need the hover here */
  ${({ $isOrphan }) =>
    !$isOrphan &&
    `
    &:hover {
      background: var(--pf-t--global--background--color--primary--hover);
    };
  `}
`;
