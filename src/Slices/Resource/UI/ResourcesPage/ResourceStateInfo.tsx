import { Flex, FlexItem, Content, Icon, ListItem, List, Popover } from "@patternfly/react-core";
import { UnlinkIcon, ClockIcon, CubesIcon } from "@patternfly/react-icons";
import { Resource } from "@/Core";
import { words } from "@/UI";
import { DateWithTooltip, statusGroupIcons, statusMapping } from "@/UI/Components";
import { BlinkingDot } from "./Components";

const COMPOUND_STATE_KEYS: (keyof Resource.CompoundStateSummary)[] = [
  "blocked",
  "compliance",
  "lastHandlerRun",
];

const StatusListItem = ({
  compoundStateKey,
  resource,
}: {
  compoundStateKey: keyof Resource.CompoundStateSummary;
  resource: Resource.Resource;
}) => {
  const state = Resource.toCompoundState(resource.state?.[compoundStateKey]);

  return (
    <ListItem
      icon={
        <Popover
          bodyContent={
            <Content component="p">{words(`resources.status.label.${compoundStateKey}`)}</Content>
          }
          triggerAction="hover"
          position="left"
        >
          {statusGroupIcons[compoundStateKey]({ state })}
        </Popover>
      }
      style={{ alignItems: "flex-end" }}
    >
      <Content>{state && statusMapping[state]}</Content>
    </ListItem>
  );
};

export const ResourceStateInfo = ({ resource }: { resource: Resource.Resource }) => {
  const lastHandlerRunAt = resource.state?.lastHandlerRunAt || "";

  /** Orphans are not actively a part of the latest intent anymore so limited information is displayed for them. */
  if (resource.state?.isOrphan) {
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
            <DateWithTooltip timestamp={lastHandlerRunAt} isFull />
          </Content>
        </ListItem>
      </List>
    );
  }

  return (
    <List isPlain>
      {COMPOUND_STATE_KEYS.map((compoundStateKey) => (
        <StatusListItem
          key={compoundStateKey}
          compoundStateKey={compoundStateKey}
          resource={resource}
        />
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
          <DateWithTooltip timestamp={lastHandlerRunAt} isFull />
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
          {resource.requiresLength}{" "}
          {resource.requiresLength === 1
            ? words("resources.popover.requirement")
            : words("resources.popover.requirements")}
        </Content>
      </ListItem>

      {resource.state?.isDeploying && (
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
