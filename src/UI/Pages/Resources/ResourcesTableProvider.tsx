import React from "react";
import { Resource, Sort } from "@/Core";
import { ResourcesTable } from "./ResourcesTable";
import { ResourcesTablePresenter } from "./ResourcesTablePresenter";

interface Props {
  resources: Resource.Resource[];
  sort: Sort.Type<Resource.SortKey>;
  setSort: (sort: Sort.Type<Resource.SortKey>) => void;
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
