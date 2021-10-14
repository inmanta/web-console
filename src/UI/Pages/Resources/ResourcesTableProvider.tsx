import { Resource, Sort } from "@/Core";
import React from "react";
import { ResourcesTable } from "./ResourcesTable";
import { ResourcesTablePresenter } from "./ResourcesTablePresenter";

interface Props {
  resources: Resource[];
  sort: Sort.Type;
  setSort: (sort: Sort.Type) => void;
}

export const ResourcesTableProvider: React.FC<Props> = ({
  resources,
  sort,
  setSort,
  ...props
}) => {
  const tablePresenter = new ResourcesTablePresenter();
  const rows = tablePresenter.createRows(resources);
  return (
    <ResourcesTable
      {...props}
      rows={rows}
      sort={sort}
      setSort={setSort}
      tablePresenter={tablePresenter}
    />
  );
};
