import React, { useContext } from "react";
import { KeycloakInstance } from "keycloak-js";
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
import { InstanceSetStateManager } from "./InstanceSetStateManager";
import { TimezoneContext } from "@/UI/Dependency";

export interface Props {
  instances: ServiceInstanceModelWithTargetStates[];
  serviceEntity: ServiceModel;
  keycloak?: KeycloakInstance;
  sortColumn?: string;
  setSortColumn: (name?: string) => void;
  order?: SortDirection;
  setOrder: (order?: SortDirection) => void;
}

export const TableProvider: React.FC<Props> = ({
  instances,
  serviceEntity,
  keycloak,
  sortColumn,
  order,
  setSortColumn,
  setOrder,
  ...props
}) => {
  const timezone = useContext(TimezoneContext);
  const datePresenter = new MomentDatePresenter(timezone);
  const attributesPresenter = new AttributesPresenter();
  const instanceSetStatePresenter = new InstanceSetStateManager(
    instances,
    keycloak
  );
  const actionPresenter = new InstanceActionPresenter(
    instances,
    keycloak,
    instanceSetStatePresenter,
    serviceEntity
  );
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
