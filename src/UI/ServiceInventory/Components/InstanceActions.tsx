import React from "react";
import { KeycloakInstance } from "keycloak-js";
import { DiagnosticsModal } from "@app/ServiceInventory/DiagnosticsModal";
import { ServiceInstanceForAction } from "@/UI/ServiceInventory/Presenters";
import { DescriptionList, DescriptionListGroup } from "@patternfly/react-core";
import { SetStateAction } from "./SetStateAction";
import { EditInstanceModal } from "@/UI/ServiceInstanceForm/Edit/EditInstanceModal";
import { DeleteModal } from "@/UI/ServiceInstanceForm/Delete/DeleteModal";

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
        <SetStateAction
          id={instance.id}
          targets={instance.instanceSetStateTargets}
          onSetInstanceState={onSetInstanceState}
        />
      </DescriptionListGroup>
    </DescriptionList>
  );
};
