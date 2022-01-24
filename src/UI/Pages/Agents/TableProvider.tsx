import React from "react";
import { Agent, Sort } from "@/Core";
import { AgentsTable } from "./AgentsTable";
import { AgentsTablePresenter } from "./AgentsTablePresenter";

interface Props {
  agents: Agent[];
  sort: Sort.Type;
  setSort: (sort: Sort.Type) => void;
}

export const TableProvider: React.FC<Props> = ({ agents, ...props }) => {
  const tablePresenter = new AgentsTablePresenter();
  const rows = tablePresenter.createRows(agents);
  return <AgentsTable {...props} tablePresenter={tablePresenter} rows={rows} />;
};
