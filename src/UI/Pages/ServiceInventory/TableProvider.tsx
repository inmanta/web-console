import React from "react";
import {
  ServiceModel,
  ServiceInstanceModelWithTargetStates,
  SortDirection,
} from "@/Core";
import {
  AttributesPresenter,
  InstanceActionPresenter,
  InstanceStatePresenter,
  MomentDatePresenter,
  InventoryTablePresenter,
} from "./Presenters";
import { InventoryTable } from "./InventoryTable";

export interface Props {
  instances: ServiceInstanceModelWithTargetStates[];
  serviceEntity: ServiceModel;
  sortColumn?: string;
  setSortColumn: (name?: string) => void;
  order?: SortDirection;
  setOrder: (order?: SortDirection) => void;
}

export const TableProvider: React.FC<Props> = ({
  instances,
  serviceEntity,
  sortColumn,
  order,
  setSortColumn,
  setOrder,
  ...props
}) => {
  const datePresenter = new MomentDatePresenter();
  const attributesPresenter = new AttributesPresenter();
  const actionPresenter = new InstanceActionPresenter(instances, serviceEntity);
  const statePresenter = new InstanceStatePresenter(instances, serviceEntity);
  const tablePresenter = new InventoryTablePresenter(
    datePresenter,
    attributesPresenter,
    actionPresenter,
    statePresenter,
    serviceEntity.service_identity,
    serviceEntity.service_identity_display_name
  );
  const rows = tablePresenter.createRows(instances);
  return (
    <InventoryTable
      {...props}
      rows={rows}
      tablePresenter={tablePresenter}
      sortColumn={sortColumn}
      order={order}
      setSortColumn={setSortColumn}
      setOrder={setOrder}
    />
  );
};
