import { Flex, FlexItem, Content, Icon, ListItem, List, Popover } from "@patternfly/react-core";
import { UnlinkIcon, ClockIcon, CubesIcon } from "@patternfly/react-icons";
import { Resource } from "@/Core";
import { words } from "@/UI";
import { DateWithTooltip, statusGroupIcons, statusMapping } from "@/UI/Components";
import { BlinkingDot } from "./Components";
import { ResourceRow } from "./ResourceTableRow";

const COMPOUND_STATE_KEYS: (keyof Resource.CompoundStateSummary)[] = [
  "blocked",
  "compliance",
  "lastHandlerRun",
];

const StatusListItem = ({
  compoundStateKey,
  row,
}: {
  compoundStateKey: keyof Resource.CompoundStateSummary;
  row: ResourceRow;
}) => {
  const state = row.status[compoundStateKey];

  return (
    <ListItem
      icon={
        <Popover
          bodyContent={<Content component="p">{compoundStateKey}</Content>}
          triggerAction="hover"
          position="left"
        >
          <>{statusGroupIcons[compoundStateKey]({ state })}</>
        </Popover>
      }
      style={{ alignItems: "flex-end" }}
    >
      <Content>{statusMapping[state]}</Content>
    </ListItem>
  );
};

export const ResourceStateInfo = ({ row }: { row: ResourceRow }) => {
  /** Orphans are not actively a part of the latest intent anymore so limited information is displayed for them. */
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
      {COMPOUND_STATE_KEYS.map((compoundStateKey) => (
        <StatusListItem key={compoundStateKey} compoundStateKey={compoundStateKey} row={row} />
      ))}

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
