import React from "react";
import {
  OnSort,
  Table /* data-codemods */,
  TableVariant,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { Sort } from "@/Core";
import { useUrlStateWithExpansion } from "@/Data";
import { ResourceHistoryRow } from "@S/ResourceDetails/Core/ResourceHistory";
import { ResourceHistoryTableRow } from "./ResourceHistoryTableRow";
import { ResourceHistoryTablePresenter } from "./TablePresenter";

interface Props {
  tablePresenter: ResourceHistoryTablePresenter;
  sort: Sort.Type;
  setSort: (sort: Sort.Type) => void;
  rows: ResourceHistoryRow[];
  "aria-label"?: string;
}

export const ResourceHistoryTable: React.FC<Props> = ({
  tablePresenter,
  sort,
  setSort,
  rows,
  ...props
}) => {
  const [isExpanded, onExpansion] = useUrlStateWithExpansion({
    route: "ResourceDetails",
    key: "history-expansion",
  });
  const onSort: OnSort = (event, index, order) => {
    setSort({ ...sort, order });
  };
  // The resource history table is only sortable by one column
  const heads = tablePresenter
    .getColumnHeadDisplayNames()
    .map((column, columnIndex) => {
      const sortParams =
        columnIndex == 0
          ? {
              sort: {
                sortBy: {
                  index: 0,
                  direction: sort.order,
                },
                onSort,
                columnIndex,
              },
            }
          : {};
      return (
        <Th key={column} {...sortParams}>
          {column}
        </Th>
      );
    });

  return (
    <Table {...props} variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th />
          {heads}
        </Tr>
      </Thead>
      {rows.map((row, idx) => (
        <ResourceHistoryTableRow
          row={row}
          key={row.id}
          index={idx}
          isExpanded={isExpanded(row.id)}
          onToggle={onExpansion(row.id)}
          numberOfColumns={tablePresenter.getNumberOfColumns()}
        />
      ))}
    </Table>
  );
};
