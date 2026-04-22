import { Flex, FlexItem, Content, Icon, ListItem, List } from "@patternfly/react-core";
import { UnlinkIcon, ClockIcon, CubesIcon } from "@patternfly/react-icons";
import { words } from "@/UI";
import { DateWithTooltip, statusGroupIcons, statusMapping } from "@/UI/Components";
import { BlinkingDot } from "./Components";
import { ResourceRow } from "./ResourceTableRow";

/** Orphans are not actively a part of the latest intent anymore so limited information is displayed for them. */
export const ResourceStateInfo = ({ row }: { row: ResourceRow }) => {
  if (row.status.isOrphan) {
    return (
      <List isPlain>
        <ListItem
          icon={
            <Icon size="heading_2xl">
              <UnlinkIcon />
            </Icon>
          }
          style={{ alignItems: "flex-end" }}
        >
          <Content>{words("resources.popover.orphan")}</Content>
        </ListItem>
        <ListItem
          icon={
            <Icon size="heading_2xl">
              <ClockIcon />
            </Icon>
          }
          style={{ alignItems: "flex-end" }}
        >
          <Content>
            {words("resources.popover.lastDeployed")}
            <DateWithTooltip timestamp={row.status.lastHandlerRunAt || ""} isFull />
          </Content>
        </ListItem>
      </List>
    );
  }

  return (
    <List isPlain>
      <ListItem
        icon={statusGroupIcons["blocked"]({ state: row.status.blocked })}
        style={{ alignItems: "flex-end" }}
      >
        <Content>{statusMapping[row.status.blocked]}</Content>
      </ListItem>

      <ListItem
        icon={statusGroupIcons["compliance"]({ state: row.status.compliance })}
        style={{ alignItems: "flex-end" }}
      >
        <Content>{statusMapping[row.status.compliance]}</Content>
      </ListItem>

      <ListItem
        icon={statusGroupIcons["lastHandlerRun"]({ state: row.status.lastHandlerRun })}
        style={{ alignItems: "flex-end" }}
      >
        <Content>{statusMapping[row.status.lastHandlerRun]}</Content>
      </ListItem>

      <ListItem
        icon={
          <Icon size="heading_2xl">
            <ClockIcon />
          </Icon>
        }
        style={{ alignItems: "flex-end" }}
      >
        <Content>
          {words("resources.popover.lastDeployed")}
          <DateWithTooltip timestamp={row.status.lastHandlerRunAt || ""} isFull />
        </Content>
      </ListItem>

      <ListItem
        icon={
          <Icon size="heading_2xl">
            <CubesIcon />
          </Icon>
        }
        style={{ alignItems: "flex-end" }}
      >
        <Content>
          {row.requiresLength}{" "}
          {row.requiresLength === 1
            ? words("resources.popover.requirement")
            : words("resources.popover.requirements")}
        </Content>
      </ListItem>

      {row.status.isDeploying && (
        <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
          <FlexItem style={{ margin: "0px 5px", display: "inline-flex" }}>
            <BlinkingDot $size={10} />
          </FlexItem>
          <Content component="p">{words("resources.popover.deploying")}</Content>
        </Flex>
      )}
    </List>
  );
};
