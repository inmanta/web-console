import React from "react";
import {
  ServiceModel,
  ServiceInstanceModelWithTargetStates,
  Sort,
} from "@/Core";
import { InventoryTable } from "./InventoryTable";
import { InventoryTablePresenter } from "./Presenters";

interface Props {
  instances: ServiceInstanceModelWithTargetStates[];
  serviceEntity: ServiceModel;
  sort: Sort.Type;
  setSort: (sort: Sort.Type) => void;
}

export const TableProvider: React.FC<Props> = ({
  instances,
  serviceEntity,
  sort,
  setSort,
  ...props
}) => {
  const tablePresenter = new InventoryTablePresenter(
    serviceEntity.service_identity,
    serviceEntity.service_identity_display_name,
  );
  const rows = tablePresenter.createRows(instances, serviceEntity);

  return (
    <InventoryTable
      {...props}
      rows={rows}
      service={serviceEntity}
      tablePresenter={tablePresenter}
      sort={sort}
      setSort={setSort}
    />
  );
};
