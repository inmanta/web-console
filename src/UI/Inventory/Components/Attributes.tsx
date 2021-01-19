import React from "react";
import {
  OutlinedQuestionCircleIcon,
  ListIcon,
  RedoIcon,
} from "@patternfly/react-icons";
import { List, ListItem, ListVariant } from "@patternfly/react-core";
import { AttributesSummary } from "@/Core";

export const Attributes: React.FC<{ summary: AttributesSummary }> = ({
  summary: { candidate, active, rollback },
}) => (
  <List variant={ListVariant.inline}>
    <ListItem>
      <OutlinedQuestionCircleIcon color={getColor(candidate)} />
    </ListItem>
    <ListItem>
      <ListIcon color={getColor(active)} />
    </ListItem>
    <ListItem>
      <RedoIcon color={getColor(rollback)} />
    </ListItem>
  </List>
);

function getColor(enabled: boolean) {
  return enabled ? "#030303" : "#D2D2D2";
}
