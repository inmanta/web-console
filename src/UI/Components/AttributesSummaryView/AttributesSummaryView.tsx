import React from "react";
import {
  Icon,
  List,
  ListItem,
  ListVariant,
  Tooltip,
} from "@patternfly/react-core";
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
        <Icon style={{ color: getColor(candidate) }}>
          <OutlinedQuestionCircleIcon />
        </Icon>
      </Tooltip>
    </ListItem>
    <ListItem aria-label={`Active-${active ? "NotEmpty" : "Empty"}`}>
      <Tooltip content={words("attributes.active")} entryDelay={200}>
        <Icon style={{ color: getColor(active) }}>
          <ListIcon />
        </Icon>
      </Tooltip>
    </ListItem>
    <ListItem aria-label={`Rollback-${rollback ? "NotEmpty" : "Empty"}`}>
      <Tooltip content={words("attributes.rollback")} entryDelay={200}>
        <Icon style={{ color: getColor(rollback) }}>
          <UndoIcon />
        </Icon>
      </Tooltip>
    </ListItem>
  </List>
);

function getColor(enabled: boolean) {
  return enabled ? "#030303" : "#D2D2D2";
}
