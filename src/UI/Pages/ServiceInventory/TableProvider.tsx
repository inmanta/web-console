import React from "react";
import {
  ServiceModel,
  ServiceInstanceModelWithTargetStates,
  Sort,
} from "@/Core";
import { MomentDatePresenter } from "@/UI/Utils";
import { InventoryTable } from "./InventoryTable";
import {
  AttributesPresenter,
  InstanceActionPresenter,
  InstanceStatePresenter,
  InventoryTablePresenter,
} from "./Presenters";

export interface Props {
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
      sort={sort}
      setSort={setSort}
    />
  );
};
