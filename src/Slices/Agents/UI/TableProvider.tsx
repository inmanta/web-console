import React, { useContext } from "react";
import { Sort } from "@/Core";
import { Agent } from "@/Core/Domain/Agent";
import { DependencyContext } from "@/UI/Dependency";
import { AgentsTable } from "./AgentsTable";
import { createAgentsTablePresenter } from "./AgentsTablePresenter";

interface Props {
  agents: Agent[];
  sort: Sort.Type;
  setSort: (sort: Sort.Type) => void;
}

export const TableProvider: React.FC<Props> = ({ agents, ...props }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const isHalted = environmentHandler.useIsHalted();
  const tablePresenter = createAgentsTablePresenter(isHalted);
  const rows = tablePresenter.createRows(agents);

  return <AgentsTable {...props} tablePresenter={tablePresenter} rows={rows} />;
};
