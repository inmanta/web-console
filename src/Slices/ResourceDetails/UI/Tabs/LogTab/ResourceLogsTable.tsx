import React from "react";
import {
  OnSort,
  Table /* data-codemods */,
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

  const onSort: OnSort = (_event, _index, order) => {
    setSort({ ...sort, order });
  };

  return (
    <Table aria-label="ResourceLogsTable" variant="compact">
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
          onToggle={onExpansion(getUniqueId(log))}
          isExpanded={isExpanded(getUniqueId(log))}
          key={getUniqueId(log)}
          log={log}
          numberOfColumns={6}
          toggleActionType={toggleActionType}
        />
      ))}
    </Table>
  );
};

function getUniqueId(log: ResourceLog): string {
  return `${log.action_id}_${log.timestamp}`;
}

const LogLevelTh = styled(Th)`
  --pf-v5-c-table--cell--MinWidth: 10ch;
`;

const ActionTypeTh = styled(Th)`
  --pf-v5-c-table--cell--MinWidth: 12ch;
`;
