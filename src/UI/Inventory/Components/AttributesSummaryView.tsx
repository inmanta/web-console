import React from "react";
import {
  OutlinedQuestionCircleIcon,
  ListIcon,
  RedoIcon,
} from "@patternfly/react-icons";
import { List, ListItem, ListVariant, Tooltip } from "@patternfly/react-core";
import { AttributesSummary } from "@/Core";
import { words } from "@/UI/words";

export const AttributesSummaryView: React.FC<{
  summary: AttributesSummary;
}> = ({ summary: { candidate, active, rollback } }) => (
  <List variant={ListVariant.inline}>
    <ListItem>
      <Tooltip content={words("attributes.candidate")} entryDelay={200}>
        <OutlinedQuestionCircleIcon color={getColor(candidate)} />
      </Tooltip>
    </ListItem>
    <ListItem>
      <Tooltip content={words("attributes.active")} entryDelay={200}>
        <ListIcon color={getColor(active)} />
      </Tooltip>
    </ListItem>
    <ListItem>
      <Tooltip content={words("attributes.rollback")} entryDelay={200}>
        <RedoIcon color={getColor(rollback)} />
      </Tooltip>
    </ListItem>
  </List>
);

function getColor(enabled: boolean) {
  return enabled ? "#030303" : "#D2D2D2";
}
