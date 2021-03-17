import React from "react";
import { KeycloakInstance } from "keycloak-js";
import {
  ServiceModel,
  ServiceInstanceModelWithTargetStates,
  Query,
} from "@/Core";
import {
  AttributesPresenter,
  InstanceActionPresenter,
  InstanceStatePresenter,
  MomentDatePresenter,
  InventoryTablePresenter,
} from "./Presenters";
import { InventoryTable } from "./InventoryTable";
import { InstanceSetStateManager } from "./InstanceSetStateManager";
import { Button, Toolbar, ToolbarItem } from "@patternfly/react-core";
import { AngleLeftIcon, AngleRightIcon } from "@patternfly/react-icons";

export interface Props {
  instances: ServiceInstanceModelWithTargetStates[];
  serviceEntity: ServiceModel;
  handlers: Query.PaginationHandlers;
  keycloak?: KeycloakInstance;
}

export const TableProvider: React.FC<Props> = ({
  instances,
  serviceEntity,
  handlers,
  keycloak,
}) => {
  const datePresenter = new MomentDatePresenter();
  const attributesPresenter = new AttributesPresenter();
  const instanceSetStatePresenter = new InstanceSetStateManager(
    instances,
    keycloak
  );
  const actionPresenter = new InstanceActionPresenter(
    instances,
    keycloak,
    instanceSetStatePresenter,
    serviceEntity
  );
  const statePresenter = new InstanceStatePresenter(instances, serviceEntity);
  const tablePresenter = new InventoryTablePresenter(
    datePresenter,
    attributesPresenter,
    actionPresenter,
    statePresenter,
    serviceEntity.service_identity,
    serviceEntity.service_identity_display_name
  );
  const rows = tablePresenter.createRows(instances);

  return (
    <div data-testid="InventoryTableContainer">
      <Toolbar>
        <ToolbarItem variant="pagination">
          <Pagination handlers={handlers} />
        </ToolbarItem>
      </Toolbar>
      <InventoryTable rows={rows} tablePresenter={tablePresenter} />
    </div>
  );
};

const Pagination: React.FC<{ handlers: Query.PaginationHandlers }> = ({
  handlers: { prev, next },
}) => {
  return (
    <>
      <Button variant="plain" onClick={prev} isDisabled={!Boolean(prev)}>
        <AngleLeftIcon />
      </Button>

      <Button variant="plain" onClick={next} isDisabled={!Boolean(next)}>
        <AngleRightIcon />
      </Button>
    </>
  );
};
