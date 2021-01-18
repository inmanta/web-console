import React from "react";
import { ServiceInstance } from "Core";
import { TablePresenter } from "./Presenters/TablePresenter";
import { MomentDatePresenter } from "./Presenters/MomentDatePresenter";
import { AttributesPresenter } from "./Presenters/AttributesPresenter";
import { InstanceActionPresenter } from "./Presenters/InstanceActionPresenter";
import { InventoryTable } from "./InventoryTable";

export interface Props {
  instances: ServiceInstance[];
}

export const View: React.FC<Props> = ({ instances }) => {
  const datePresenter = new MomentDatePresenter();
  const attributesPresenter = new AttributesPresenter();
  const actionPresenter = new InstanceActionPresenter(instances);
  const tablePresenter = new TablePresenter(
    datePresenter,
    attributesPresenter,
    actionPresenter
  );
  const rows = tablePresenter.createFromInstances(instances);

  return (
    <div data-testid="InventoryViewContainer">
      <InventoryTable rows={rows} tablePresenter={tablePresenter} />
    </div>
  );
};
