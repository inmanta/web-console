import React from "react";
import { Sort } from "@/Core";
import { CompileReport } from "@S/CompileReports/Core/Domain";
import { CompileReportsTable } from "./CompileReportsTable";
import { createCompileReportsTablePresenter } from "./CompileReportsTablePresenter";

interface Props {
  compileReports: CompileReport[];
  sort: Sort.Type;
  setSort: (sort: Sort.Type) => void;
}

export const TableProvider: React.FC<Props> = ({ compileReports, ...props }) => {
  const tablePresenter = createCompileReportsTablePresenter();
  const rows = tablePresenter.createRows(compileReports);

  return <CompileReportsTable {...props} tablePresenter={tablePresenter} rows={rows} />;
};
