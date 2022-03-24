import React, { useContext } from "react";
import { Agent, Sort } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { AgentsTable } from "./AgentsTable";
import { AgentsTablePresenter } from "./AgentsTablePresenter";

interface Props {
  agents: Agent[];
  sort: Sort.Type;
  setSort: (sort: Sort.Type) => void;
}

export const TableProvider: React.FC<Props> = ({ agents, ...props }) => {
  const { environmentModifier } = useContext(DependencyContext);
  const isHalted = environmentModifier.useIsHalted();
  const tablePresenter = new AgentsTablePresenter(isHalted);
  const rows = tablePresenter.createRows(agents);
  return <AgentsTable {...props} tablePresenter={tablePresenter} rows={rows} />;
};
