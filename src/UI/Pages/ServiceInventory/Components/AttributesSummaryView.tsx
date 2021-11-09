import React from "react";
import { List, ListItem, ListVariant, Tooltip } from "@patternfly/react-core";
import {
  OutlinedQuestionCircleIcon,
  ListIcon,
  UndoIcon,
} from "@patternfly/react-icons";
import { AttributesSummary } from "@/Core";
import { words } from "@/UI/words";

export const AttributesSummaryView: React.FC<{
  summary: AttributesSummary;
  onClick: () => void;
}> = ({ summary: { candidate, active, rollback }, onClick }) => (
  <List
    variant={ListVariant.inline}
    onClick={onClick}
    data-testid={`attributes-summary`}
    aria-label={`AttributesSummary`}
  >
    <ListItem aria-label={`Candidate-${candidate ? "NotEmpty" : "Empty"}`}>
      <Tooltip content={words("attributes.candidate")} entryDelay={200}>
        <OutlinedQuestionCircleIcon color={getColor(candidate)} />
      </Tooltip>
    </ListItem>
    <ListItem aria-label={`Active-${active ? "NotEmpty" : "Empty"}`}>
      <Tooltip content={words("attributes.active")} entryDelay={200}>
        <ListIcon color={getColor(active)} />
      </Tooltip>
    </ListItem>
    <ListItem aria-label={`Rollback-${rollback ? "NotEmpty" : "Empty"}`}>
      <Tooltip content={words("attributes.rollback")} entryDelay={200}>
        <UndoIcon color={getColor(rollback)} />
      </Tooltip>
    </ListItem>
  </List>
);

function getColor(enabled: boolean) {
  return enabled ? "#030303" : "#D2D2D2";
}
