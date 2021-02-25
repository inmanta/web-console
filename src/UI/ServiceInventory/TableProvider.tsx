import React from "react";
import { KeycloakInstance } from "keycloak-js";
import { ServiceInstanceModelWithTargetStates, ServiceModel } from "@/Core";
import {
  AttributesPresenter,
  InstanceActionPresenter,
  InstanceStatePresenter,
  MomentDatePresenter,
  InventoryTablePresenter,
} from "./Presenters";
import { InventoryTable } from "./InventoryTable";
import { InstanceSetStateManager } from "./InstanceSetStateManager";

export interface Props {
  instances: ServiceInstanceModelWithTargetStates[];
  keycloak?: KeycloakInstance;
  serviceEntity: ServiceModel;
}

export const TableProvider: React.FC<Props> = ({
  instances,
  keycloak,
  serviceEntity,
}) => {
  const datePresenter = new MomentDatePresenter();
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
    statePresenter
  );
  const rows = tablePresenter.createRows(instances);

  return (
    <div data-testid="InventoryTableContainer">
      <InventoryTable rows={rows} tablePresenter={tablePresenter} />
    </div>
  );
};
