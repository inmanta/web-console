import React from "react";
import { ServiceInstance } from "@app/Core";
import { ComposableTableExpandable } from "./DummyTable";
import { RowPresenter } from "./RowPresenter";
import { InventoryTable } from "./InventoryTable";
import { MomentDatePresenter } from "./MomentDatePresenter";

export interface Props {
  instances: ServiceInstance[];
}

export const View: React.FC<Props> = ({ instances }) => {
  const datePresenter = new MomentDatePresenter();
  const rowPresenter = new RowPresenter(datePresenter);
  const rows = rowPresenter.createFromInstances(instances);

  return (
    <div data-testid="InventoryViewContainer">
      {rows.length > 0 && <InventoryTable rows={rows} />}
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
