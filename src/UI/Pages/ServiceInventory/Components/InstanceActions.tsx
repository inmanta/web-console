import React from "react";
import { KeycloakInstance } from "keycloak-js";
import { DiagnosticsModal } from "@/UI/Pages/ServiceInventory";
import { ServiceInstanceForAction } from "@/UI/Pages/ServiceInventory/Presenters";
import {
  Button,
  DescriptionList,
  DescriptionListGroup,
} from "@patternfly/react-core";
import { SetStateAction } from "./SetStateAction";
import { EditInstanceModal } from "@/UI/Pages/ServiceInstanceForm/Edit/EditInstanceModal";
import { DeleteModal } from "@/UI/Pages/ServiceInstanceForm/Delete/DeleteModal";
import { Link, useLocation } from "react-router-dom";
import { HistoryIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";

export interface InstanceActionsProps {
  instance: ServiceInstanceForAction;
  keycloak?: KeycloakInstance;
  editDisabled: boolean;
  deleteDisabled: boolean;
  onSetInstanceState:
    | ((
        instanceId: string,
        targetState: string,
        setErrorMessage: (message: string) => void
      ) => Promise<void>)
    | null;
}

export const InstanceActions: React.FC<InstanceActionsProps> = ({
  instance,
  keycloak,
  editDisabled,
  deleteDisabled,
  onSetInstanceState,
}) => {
  const location = useLocation();
  if (instance.state === "terminated") return null;
  return (
    <DescriptionList>
      <DescriptionListGroup>
        <EditInstanceModal
          isDisabled={editDisabled}
          instance={instance}
          keycloak={keycloak}
        />
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DeleteModal
          isDisabled={deleteDisabled}
          serviceName={instance.service_entity}
          instanceId={instance.id}
          instanceVersion={instance.version}
          keycloak={keycloak}
        />
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DiagnosticsModal
          serviceName={instance.service_entity}
          instance={instance}
          keycloak={keycloak}
        />
      </DescriptionListGroup>
      <DescriptionListGroup>
        <Link
          to={{
            pathname: `/lsm/catalog/${instance.service_entity}/inventory/${instance.id}/history`,
            search: location.search,
          }}
        >
          <Button isBlock>
            <HistoryIcon /> {words("inventory.statusTab.history")}
          </Button>
        </Link>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <SetStateAction
          id={instance.id}
          targets={instance.instanceSetStateTargets}
          onSetInstanceState={onSetInstanceState}
        />
      </DescriptionListGroup>
    </DescriptionList>
  );
};
