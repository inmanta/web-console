import React from "react";
import { CompileReport, CompileReportRow, SortDirection } from "@/Core";
import {
  OnSort,
  TableComposable,
  TableVariant,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { CompileReportsTableRow } from "./CompileReportsTableRow";
import { TablePresenter } from "@/UI/Presenters";

interface Props {
  tablePresenter: TablePresenter<CompileReport, CompileReportRow>;
  rows: CompileReportRow[];
  order: SortDirection;
  setOrder: (order: SortDirection) => void;
}

export const CompileReportsTable: React.FC<Props> = ({
  tablePresenter,
  rows,
  order,
  setOrder,
  ...props
}) => {
  const onSort: OnSort = (event, index, direction) => {
    setOrder(direction);
  };
  // The compile reports table is only sortable by one column
  const heads = tablePresenter
    .getColumnHeadDisplayNames()
    .map((column, columnIndex) => {
      const sortParams =
        columnIndex == 0
          ? {
              sort: {
                sortBy: {
                  index: 0,
                  direction: order,
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
    <TableComposable {...props} variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th> </Th>
          {heads}
        </Tr>
      </Thead>
      {rows.map((row) => (
        <CompileReportsTableRow row={row} key={row.id} />
      ))}
    </TableComposable>
  );
};
