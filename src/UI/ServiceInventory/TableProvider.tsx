import React from "react";
import { KeycloakInstance } from "keycloak-js";
import { IServiceInstanceModel } from "@app/Models/LsmModels";
import {
  AttributesPresenter,
  InstanceActionPresenter,
  MomentDatePresenter,
  TablePresenter,
} from "./Presenters";
import { InventoryTable } from "./InventoryTable";
import { InstanceRow } from "./InstanceRow";
import {
  ServiceInstanceDetails,
  AttributesView,
  StatusView,
} from "@/UI/ServiceInstanceDetails";
import { InfoCircleIcon, ListIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";

export interface Props {
  instances: IServiceInstanceModel[];
  keycloak?: KeycloakInstance;
}

export const TableProvider: React.FC<Props> = ({ instances, keycloak }) => {
  const datePresenter = new MomentDatePresenter();
  const attributesPresenter = new AttributesPresenter();
  const actionPresenter = new InstanceActionPresenter(instances, keycloak);
  const tablePresenter = new TablePresenter(
    datePresenter,
    attributesPresenter,
    actionPresenter
  );
  const rows = tablePresenter.createFromInstances(instances);

  return (
    <InventoryTable
      rows={rows}
      tablePresenter={tablePresenter}
      RowComponent={({ row, ...props }) => (
        <InstanceRow
          {...props}
          row={row}
          expandedContent={
            <ServiceInstanceDetails>
              <StatusView
                title={words("inventory.tabs.status")}
                icon={<InfoCircleIcon />}
                statusInfo={{
                  instanceId: row.id.full,
                  state: row.state,
                  version: row.version,
                  createdAt: row.createdAt.full,
                  updatedAt: row.updatedAt.full,
                  actions: tablePresenter.getActionsFor(row.id.full),
                }}
              />
              <AttributesView
                attributes={row.attributes}
                title={words("inventory.tabs.attributes")}
                icon={<ListIcon />}
              />
            </ServiceInstanceDetails>
          }
        />
      )}
    />
  );
};
