import React from "react";
import { IServiceInstanceModel } from "@app/Models/LsmModels";
import { ComposableTableExpandable } from "./DummyTable";
import { RowPresenter } from "./RowPresenter";
import { InventoryTable } from "./InventoryTable";

export interface Props {
  instances: IServiceInstanceModel[];
}

export const View: React.FC<Props> = ({ instances }) => {
  const rows = new RowPresenter().createFromInstances(instances);

  return (
    <div data-testid="InventoryViewContainer">
      {rows.length > 0 && <InventoryTable rows={rows} />}
      <hr />
      <pre>
        <code>{JSON.stringify(instances, null, 4)}</code>
      </pre>
      <hr />
      <ComposableTableExpandable />
    </div>
  );
};
