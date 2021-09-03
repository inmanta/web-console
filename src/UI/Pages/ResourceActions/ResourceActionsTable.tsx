import React from "react";
import { ResourceAction } from "@/Core";
import { TableComposable, Th, Thead, Tr } from "@patternfly/react-table";
import { Row } from "./Row";
import { ExpansionManager } from "@/UI/Pages/ServiceInventory/ExpansionManager";

interface Props {
  actions: ResourceAction[];
}

export const ResourceActionsTable: React.FC<Props> = ({ actions }) => {
  const expansionManager = new ExpansionManager();
  const [expansionState, setExpansionState] = React.useState(
    expansionManager.create(getIds(actions))
  );
  const handleExpansionToggle = (id: string) => () => {
    setExpansionState(expansionManager.toggle(expansionState, id));
  };
  React.useEffect(() => {
    setExpansionState(expansionManager.merge(expansionState, getIds(actions)));
  }, [actions]);

  return (
    <TableComposable aria-label="CallbacksTable" variant="compact">
      <Thead>
        <Tr>
          <Th />
          <Th>Timestamp</Th>
          <Th>Action Type</Th>
          <Th>Log Level</Th>
          <Th>Message</Th>
        </Tr>
      </Thead>
      {actions.map((action, index) => (
        <Row
          index={index}
          onToggle={handleExpansionToggle(action.action_id)}
          isExpanded={expansionState[action.action_id]}
          key={action.action_id}
          action={action}
          numberOfColumns={4}
        />
      ))}
    </TableComposable>
  );
};

function getIds(callbacks: ResourceAction[]): string[] {
  return callbacks.map((action) => action.action_id);
}
