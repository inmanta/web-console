import React from "react";
import { ServiceInstance } from "@app/Core";
import { ComposableTableExpandable } from "./DummyTable";
import { TablePresenter } from "./TablePresenter";
import { InventoryTable } from "./InventoryTable";
import { MomentDatePresenter } from "./MomentDatePresenter";
import { AttributePresenter } from "./AttributePresenter";

export interface Props {
  instances: ServiceInstance[];
}

export const View: React.FC<Props> = ({ instances }) => {
  const datePresenter = new MomentDatePresenter();
  const attributePresenter = new AttributePresenter();
  const tablePresenter = new TablePresenter(datePresenter, attributePresenter);
  const rows = tablePresenter.createFromInstances(instances);

  return (
    <div data-testid="InventoryViewContainer">
      {rows.length > 0 && (
        <InventoryTable rows={rows} tablePresenter={tablePresenter} />
      )}
      <hr />
      <pre>
        <code>{JSON.stringify(rows, null, 4)}</code>
      </pre>
      <hr />
      <pre>
        <code>{JSON.stringify(instances, null, 4)}</code>
      </pre>
      <hr />
      <ComposableTableExpandable />
    </div>
  );
};
