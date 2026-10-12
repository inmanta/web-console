import React from "react";
import { OnSort, Table, TableVariant, Th, Thead, Tr } from "@patternfly/react-table";
import { Sort } from "@/Core";
import { words } from "@/UI/words";
import { AgentRow } from "@S/Agents/Core/Domain";
import { AgentsTablePresenter } from "./AgentsTablePresenter";
import { AgentsTableRow } from "./AgentsTableRow";

interface Props {
  tablePresenter: AgentsTablePresenter;
  rows: AgentRow[];
  sort: Sort.Type;
  setSort: (sort: Sort.Type) => void;
}

export const AgentsTable: React.FC<Props> = ({ tablePresenter, rows, sort, setSort, ...props }) => {
  const onSort: OnSort = (event, index, order) => {
    setSort({
      name: tablePresenter.getColumnNameForIndex(index) as string,
      order,
    });
  };
  const activeSortIndex = tablePresenter.getIndexForColumnName(sort.name);
  const heads = tablePresenter.getColumnHeads().map(({ apiName, displayName }, columnIndex) => {
    const hasSort = tablePresenter.getSortableColumnNames().includes(apiName);
    const sortParams = hasSort
      ? {
          sort: {
            sortBy: {
              index: activeSortIndex,
              direction: sort.order,
            },
            onSort,
            columnIndex,
          },
        }
      : {};

    return (
      <Th key={displayName} {...sortParams}>
        {displayName}
      </Th>
    );
  });

  return (
    <Table {...props} variant={TableVariant.compact} isStickyHeader>
      <Thead>
        <Tr>
          {heads}
          <Th modifier="fitContent" screenReaderText={words("common.emptyColumnHeader")} />
          <Th screenReaderText={words("common.emptyColumnHeader")} />
        </Tr>
      </Thead>
      {rows.map((row) => (
        <AgentsTableRow row={row} key={row.name} />
      ))}
    </Table>
  );
};
