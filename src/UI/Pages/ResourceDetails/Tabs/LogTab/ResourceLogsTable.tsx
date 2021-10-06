import React from "react";
import styled from "styled-components";
import { ResourceLog, SortDirection } from "@/Core";
import {
  OnSort,
  TableComposable,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { Row } from "./Row";
import { ExpansionManager } from "@/UI/Pages/ServiceInventory/ExpansionManager";
import { ToggleActionType } from "./RowOptions";
import { words } from "@/UI/words";

interface Props {
  logs: ResourceLog[];
  toggleActionType: ToggleActionType;
  order: SortDirection;
  setOrder: (order: SortDirection) => void;
}

export const ResourceLogsTable: React.FC<Props> = ({
  logs,
  toggleActionType,
  order,
  setOrder,
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

  const onSort: OnSort = (event, index, direction) => {
    setOrder(direction);
  };

  return (
    <TableComposable aria-label="ResourceLogsTable" variant="compact">
      <Thead>
        <Tr>
          <Th />
          <Th
            sort={{
              sortBy: { index: 0, direction: order },
              onSort,
              columnIndex: 0,
            }}
          >
            {words("resources.logs.timestamp")}
          </Th>
          <ActionTypeTh>{words("resources.logs.actionType")}</ActionTypeTh>
          <LogLevelTh>{words("resources.logs.logLevel")}</LogLevelTh>
          <Th>{words("resources.logs.message")}</Th>
          <Th>{words("resources.logs.options")}</Th>
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
          toggleActionType={toggleActionType}
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
