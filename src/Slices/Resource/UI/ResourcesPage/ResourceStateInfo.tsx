import { Flex, FlexItem, Content, Icon } from "@patternfly/react-core";
import { UnlinkIcon, ClockIcon, CubesIcon } from "@patternfly/react-icons";
import { words } from "@/UI";
import { DateWithTooltip, statusGroupIcons, statusMapping } from "@/UI/Components";
import { BlinkingDot } from "./Components";
import { ResourceRow } from "./ResourceTableRow";

const RowComponent: React.FC<{
  icon: React.ReactNode;
  text: React.ReactNode;
}> = ({ icon, text }) => (
  <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
    <FlexItem style={{ display: "inline-flex" }}>{icon}</FlexItem>
    <Content>{text}</Content>
  </Flex>
);

/** Orphans are not actively a part of the latest intent anymore so limited information is displayed for them. */
export const ResourceStateInfo = ({ row }: { row: ResourceRow }) => {
  if (row.status.isOrphan) {
    return (
      <Flex direction={{ default: "column" }}>
        <RowComponent
          icon={
            <Icon size="heading_2xl">
              <UnlinkIcon />
            </Icon>
          }
          text={words("resources.popover.orphan")}
        />

        <RowComponent
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
      <RowComponent
        icon={statusGroupIcons["blocked"]({ state: row.status.blocked })}
        text={statusMapping[row.status.blocked]}
      />

      <RowComponent
        icon={statusGroupIcons["compliance"]({ state: row.status.compliance })}
        text={statusMapping[row.status.compliance]}
      />

      <RowComponent
        icon={statusGroupIcons["lastHandlerRun"]({ state: row.status.lastHandlerRun })}
        text={statusMapping[row.status.lastHandlerRun]}
      />

      <RowComponent
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

      <RowComponent
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
            <BlinkingDot $size={10} />
          </FlexItem>
          <Content component="p">{words("resources.popover.deploying")}</Content>
        </Flex>
      )}
    </Flex>
  );
};
