import React from "react";
import { CompileReport, SortDirection } from "@/Core";
import { MomentDatePresenter } from "@/UI/Utils";
import { CompileReportsTable } from "./CompileReportsTable";
import { CompileReportsTablePresenter } from "./CompileReportsTablePresenter";

interface Props {
  compileReports: CompileReport[];
  order: SortDirection;
  setOrder: (order: SortDirection) => void;
}

export const TableProvider: React.FC<Props> = ({
  compileReports,
  ...props
}) => {
  const tablePresenter = new CompileReportsTablePresenter(
    new MomentDatePresenter()
  );
  const rows = tablePresenter.createRows(compileReports);
  return (
    <CompileReportsTable
      {...props}
      tablePresenter={tablePresenter}
      rows={rows}
    />
  );
};
