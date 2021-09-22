import React from "react";
import { CompileReport, CompileReportRow } from "@/Core";
import {
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
}

export const CompileReportsTable: React.FC<Props> = ({
  tablePresenter,
  rows,
  ...props
}) => {
  const heads = tablePresenter.getColumnHeadDisplayNames().map((column) => {
    return <Th key={column}>{column}</Th>;
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
