import React from "react";
import { ServiceInstance } from "Core";
import { TablePresenter } from "./TablePresenter";
import { InventoryTable } from "./InventoryTable";
import { MomentDatePresenter } from "./MomentDatePresenter";
import { AttributePresenter } from "./AttributePresenter";
import { InstanceActionPresenter } from "./Actions/InstanceActionPresenter";

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
