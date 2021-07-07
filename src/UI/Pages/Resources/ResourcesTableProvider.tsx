import { Resource, SortDirection } from "@/Core";
import React from "react";
import { ResourcesTable } from "./ResourcesTable";
import { ResourcesTablePresenter } from "./ResourcesTablePresenter";

interface Props {
  resources: Resource[];
  sortColumn?: string;
  order?: SortDirection;
  setSortColumn: (name?: string) => void;
  setOrder: (order?: SortDirection) => void;
}

export const ResourcesTableProvider: React.FC<Props> = ({
  resources,
  sortColumn,
  order,
  setSortColumn,
  setOrder,
  ...props
}) => {
  const tablePresenter = new ResourcesTablePresenter();
  const rows = tablePresenter.createRows(resources);
  return (
    <ResourcesTable
      {...props}
      rows={rows}
      sortColumn={sortColumn}
      order={order}
      setSortColumn={setSortColumn}
      setOrder={setOrder}
      tablePresenter={tablePresenter}
    />
  );
};
