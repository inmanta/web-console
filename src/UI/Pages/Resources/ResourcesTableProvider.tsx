import { LatestReleasedResource } from "@/Core";
import React from "react";
import { ResourcesTable } from "./ResourcesTable";
import { ResourcesTablePresenter } from "./ResourcesTablePresenter";

interface Props {
  resources: LatestReleasedResource[];
}

export const ResourcesTableProvider: React.FC<Props> = ({
  resources,
  ...props
}) => {
  const tablePresenter = new ResourcesTablePresenter();
  const rows = tablePresenter.createRows(resources);
  return (
    <ResourcesTable
      {...props}
      rows={rows}
      columnHeads={tablePresenter.getColumnHeadDisplayNames()}
    />
  );
};
