import React from "react";
import { ServiceInstance } from "Core";
import { TablePresenter } from "./Presenters/TablePresenter";
import { MomentDatePresenter } from "./Presenters/MomentDatePresenter";
import { AttributePresenter } from "./Presenters/AttributePresenter";
import { InstanceActionPresenter } from "./Presenters/InstanceActionPresenter";
import { InventoryTable } from "./InventoryTable";

export interface Props {
  instances: ServiceInstance[];
}

export const View: React.FC<Props> = ({ instances }) => {
  const datePresenter = new MomentDatePresenter();
  const attributePresenter = new AttributePresenter();
  const actionPresenter = new InstanceActionPresenter(instances);
  const tablePresenter = new TablePresenter(
    datePresenter,
    attributePresenter,
    actionPresenter
  );
  const rows = tablePresenter.createFromInstances(instances);

  return (
    <div data-testid="InventoryViewContainer">
      <InventoryTable rows={rows} tablePresenter={tablePresenter} />
    </div>
  );
};
