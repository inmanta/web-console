import React from "react";
import { KeycloakInstance } from "keycloak-js";
import {
  IServiceModel,
  ServiceInstanceModelWithTargetStates,
} from "@app/Models/LsmModels";
import {
  AttributesPresenter,
  InstanceActionPresenter,
  InstanceStatePresenter,
  MomentDatePresenter,
  TablePresenter,
} from "./Presenters";
import { InventoryTable } from "./InventoryTable";
import { InstanceSetStateManager } from "./InstanceSetStateManager";

export interface Props {
  instances: ServiceInstanceModelWithTargetStates[];
  keycloak?: KeycloakInstance;
  serviceEntity: IServiceModel;
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
    instanceSetStatePresenter
  );
  const statePresenter = new InstanceStatePresenter(instances, serviceEntity);
  const tablePresenter = new TablePresenter(
    datePresenter,
    attributesPresenter,
    actionPresenter,
    statePresenter
  );
  const rows = tablePresenter.createFromInstances(instances);

  return (
    <div data-testid="InventoryTableContainer">
      <InventoryTable rows={rows} tablePresenter={tablePresenter} />
    </div>
  );
};
