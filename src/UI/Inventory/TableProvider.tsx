import React from "react";
import { KeycloakInstance } from "keycloak-js";
import { IServiceInstanceModel } from "@app/Models/LsmModels";
import {
  AttributesPresenter,
  InstanceActionPresenter,
  MomentDatePresenter,
  TablePresenter,
  ResourcesPresenter,
} from "./Presenters";
import { InventoryTable } from "./InventoryTable";

export interface Props {
  instances: IServiceInstanceModel[];
  keycloak?: KeycloakInstance;
}

export const TableProvider: React.FC<Props> = ({ instances, keycloak }) => {
  const datePresenter = new MomentDatePresenter();
  const attributesPresenter = new AttributesPresenter();
  const actionPresenter = new InstanceActionPresenter(instances, keycloak);
  const resourcesPresenter = new ResourcesPresenter(instances, keycloak);
  const tablePresenter = new TablePresenter(
    datePresenter,
    attributesPresenter,
    actionPresenter,
    resourcesPresenter
  );
  const rows = tablePresenter.createFromInstances(instances);

  return (
    <div data-testid="InventoryTableContainer">
      <InventoryTable rows={rows} tablePresenter={tablePresenter} />
    </div>
  );
};
