import React from "react";
import { CompileReport, CompileReportRow, Sort } from "@/Core";
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
  sort: Sort.Type;
  setSort: (sort: Sort.Type) => void;
}

export const CompileReportsTable: React.FC<Props> = ({
  tablePresenter,
  rows,
  sort,
  setSort,
  ...props
}) => {
  const onSort: OnSort = (event, index, order) => {
    setSort({ ...sort, order });
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
