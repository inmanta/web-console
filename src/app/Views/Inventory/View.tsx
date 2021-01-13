import { IServiceInstanceModel } from "@app/Models/LsmModels";
import React from "react";

interface Props {
  instances: IServiceInstanceModel[];
}

export const View: React.FC<Props> = ({ instances }) => {
  return (
    <div data-testid="InventoryViewContainer">
      <pre>
        <code>{JSON.stringify(instances, null, 4)}</code>
      </pre>
    </div>
  );
};
