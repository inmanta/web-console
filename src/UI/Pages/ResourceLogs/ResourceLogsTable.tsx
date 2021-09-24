import React from "react";
import styled from "styled-components";
import { ResourceLog } from "@/Core";
import { TableComposable, Th, Thead, Tr } from "@patternfly/react-table";
import { Row } from "./Row";
import { ExpansionManager } from "@/UI/Pages/ServiceInventory/ExpansionManager";
import { ResourceLogFilter } from "@/Core/Domain/Query";

interface Props {
  logs: ResourceLog[];
  filter: ResourceLogFilter;
  setFilter: (filter: ResourceLogFilter) => void;
}

export const ResourceLogsTable: React.FC<Props> = ({
  logs,
  setFilter,
  filter,
}) => {
  const expansionManager = new ExpansionManager();
  const [expansionState, setExpansionState] = React.useState(
    expansionManager.create(getUniqueIds(logs))
  );
  const handleExpansionToggle = (id: string) => () => {
    setExpansionState(expansionManager.toggle(expansionState, id));
  };
  React.useEffect(() => {
    setExpansionState(
      expansionManager.merge(expansionState, getUniqueIds(logs))
    );
  }, [logs]);

  return (
    <TableComposable aria-label="CallbacksTable" variant="compact">
      <Thead>
        <Tr>
          <Th />
          <Th>Timestamp</Th>
          <ActionTypeTh>Action Type</ActionTypeTh>
          <LogLevelTh>Log Level</LogLevelTh>
          <Th>Message</Th>
          <Th>Options</Th>
        </Tr>
      </Thead>
      {logs.map((log, index) => (
        <Row
          index={index}
          onToggle={handleExpansionToggle(getUniqueId(log, index))}
          isExpanded={expansionState[getUniqueId(log, index)]}
          key={getUniqueId(log, index)}
          log={log}
          numberOfColumns={6}
          filter={filter}
          setFilter={setFilter}
        />
      ))}
    </TableComposable>
  );
};

function getUniqueIds(logs: ResourceLog[]): string[] {
  return logs.map(getUniqueId);
}

function getUniqueId(log: ResourceLog, index: number): string {
  return `${log.action_id}_${log.timestamp}_${index}`;
}

const LogLevelTh = styled(Th)`
  --pf-c-table--cell--MinWidth: 10ch;
`;

const ActionTypeTh = styled(Th)`
  --pf-c-table--cell--MinWidth: 12ch;
`;
