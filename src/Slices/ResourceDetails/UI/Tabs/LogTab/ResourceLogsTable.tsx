import React from "react";
import {
  OnSort,
  TableComposable,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import styled from "styled-components";
import { Sort } from "@/Core";
import { useUrlStateWithExpansion } from "@/Data";
import { words } from "@/UI/words";
import { ResourceLog } from "@S/ResourceDetails/Core/ResourceLog";
import { Row } from "./Row";
import { ToggleActionType } from "./RowOptions";

interface Props {
  logs: ResourceLog[];
  toggleActionType: ToggleActionType;
  sort: Sort.Type;
  setSort: (sort: Sort.Type) => void;
}

export const ResourceLogsTable: React.FC<Props> = ({
  logs,
  toggleActionType,
  sort,
  setSort,
}) => {
  const [isExpanded, onExpansion] = useUrlStateWithExpansion({
    key: "logs-expansion",
    route: "ResourceDetails",
  });

  const onSort: OnSort = (event, index, order) => {
    setSort({ ...sort, order });
  };

  return (
    <TableComposable aria-label="ResourceLogsTable" variant="compact">
      <Thead>
        <Tr>
          <Th />
          <Th
            sort={{
              sortBy: { index: 0, direction: sort.order },
              onSort,
              columnIndex: 0,
            }}
          >
            {words("resources.logs.timestamp")}
          </Th>
          <ActionTypeTh>{words("resources.logs.actionType")}</ActionTypeTh>
          <LogLevelTh>{words("resources.logs.logLevel")}</LogLevelTh>
          <Th>{words("resources.logs.message")}</Th>
        </Tr>
      </Thead>
      {logs.map((log, index) => (
        <Row
          index={index}
          onToggle={onExpansion(getUniqueId(log, index))}
          isExpanded={isExpanded(getUniqueId(log, index))}
          key={getUniqueId(log, index)}
          log={log}
          numberOfColumns={6}
          toggleActionType={toggleActionType}
        />
      ))}
    </TableComposable>
  );
};

function getUniqueId(log: ResourceLog, index: number): string {
  return `${log.action_id}_${log.timestamp}_${index}`;
}

const LogLevelTh = styled(Th)`
  --pf-c-table--cell--MinWidth: 10ch;
`;

const ActionTypeTh = styled(Th)`
  --pf-c-table--cell--MinWidth: 12ch;
`;
