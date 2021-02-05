import React from "react";
import { KeycloakInstance } from "keycloak-js";
import { ButtonType, InstanceModal } from "@app/ServiceInventory/InstanceModal";
import { DiagnosticsModal } from "@app/ServiceInventory/DiagnosticsModal";
import { ServiceInstanceForAction } from "@/UI/ServiceInventory/Presenters";
import { DescriptionList, DescriptionListGroup } from "@patternfly/react-core";
import { SetStateAction } from "./SetStateAction";

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
        <InstanceModal
          isDisabled={editDisabled}
          buttonType={ButtonType.edit}
          serviceName={instance.service_entity}
          instance={instance}
          keycloak={keycloak}
        />
      </DescriptionListGroup>
      <DescriptionListGroup>
        <InstanceModal
          isDisabled={deleteDisabled}
          buttonType={ButtonType.delete}
          serviceName={instance.service_entity}
          instance={instance}
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
