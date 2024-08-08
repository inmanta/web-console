import React from "react";
import { Sort } from "@/Core";
import { MomentDatePresenter } from "@/UI/Utils";
import { CompileReport } from "@S/CompileReports/Core/Domain";
import { CompileReportsTable } from "./CompileReportsTable";
import { CompileReportsTablePresenter } from "./CompileReportsTablePresenter";

interface Props {
  compileReports: CompileReport[];
  sort: Sort.Type;
  setSort: (sort: Sort.Type) => void;
}

export const TableProvider: React.FC<Props> = ({
  compileReports,
  ...props
}) => {
  const tablePresenter = new CompileReportsTablePresenter(
    new MomentDatePresenter(),
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
