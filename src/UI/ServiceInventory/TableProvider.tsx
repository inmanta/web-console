import React from "react";
import { KeycloakInstance } from "keycloak-js";
import { ServiceInstanceModelWithTargetStates } from "@/Core";
import {
  AttributesPresenter,
  InstanceActionPresenter,
  MomentDatePresenter,
  TablePresenter,
} from "./Presenters";
import { InventoryTable } from "./InventoryTable";
import { InstanceSetStateManager } from "./InstanceSetStateManager";

export interface Props {
  instances: ServiceInstanceModelWithTargetStates[];
  keycloak?: KeycloakInstance;
}

export const TableProvider: React.FC<Props> = ({ instances, keycloak }) => {
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
  const tablePresenter = new TablePresenter(
    datePresenter,
    attributesPresenter,
    actionPresenter
  );
  const rows = tablePresenter.createFromInstances(instances);

  return (
    <div data-testid="InventoryTableContainer">
      <InventoryTable rows={rows} tablePresenter={tablePresenter} />
    </div>
  );
};
