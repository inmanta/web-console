import React from "react";
import { ResourceLog } from "@/Core";
import { TableComposable, Th, Thead, Tr } from "@patternfly/react-table";
import { Row } from "./Row";
import { ExpansionManager } from "@/UI/Pages/ServiceInventory/ExpansionManager";

interface Props {
  logs: ResourceLog[];
}

export const ResourceLogsTable: React.FC<Props> = ({ logs }) => {
  const expansionManager = new ExpansionManager();
  const [expansionState, setExpansionState] = React.useState(
    expansionManager.create(getIds(logs))
  );
  const handleExpansionToggle = (id: string) => () => {
    setExpansionState(expansionManager.toggle(expansionState, id));
  };
  React.useEffect(() => {
    setExpansionState(expansionManager.merge(expansionState, getIds(logs)));
  }, [logs]);

  return (
    <TableComposable aria-label="CallbacksTable" variant="compact">
      <Thead>
        <Tr>
          <Th />
          <Th>Timestamp</Th>
          <Th>Action Type</Th>
          <Th>Log Level</Th>
          <Th>Message</Th>
          <Th>Options</Th>
        </Tr>
      </Thead>
      {logs.map((log, index) => (
        <Row
          index={index}
          onToggle={handleExpansionToggle(log.action_id)}
          isExpanded={expansionState[log.action_id]}
          key={log.action_id}
          log={log}
          numberOfColumns={6}
        />
      ))}
    </TableComposable>
  );
};

function getIds(logs: ResourceLog[]): string[] {
  return logs.map((log) => log.action_id);
}
