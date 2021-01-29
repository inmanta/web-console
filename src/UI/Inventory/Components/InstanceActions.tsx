import React from "react";
import { KeycloakInstance } from "keycloak-js";
import { ButtonType, InstanceModal } from "@app/ServiceInventory/InstanceModal";
import { DiagnosticsModal } from "@app/ServiceInventory/DiagnosticsModal";
import { ServiceInstanceForAction } from "@/UI/Inventory/Presenters";
import { DescriptionList, DescriptionListGroup } from "@patternfly/react-core";
import { ResourceModal } from "@app/ServiceInventory/ResourceModal";
import { SetStateAction } from "./SetStateAction";

interface Props {
  instance: ServiceInstanceForAction;
  keycloak?: KeycloakInstance;
  onSetInstanceState:
    | ((instanceId: string, targetState: string) => Promise<void>)
    | null;
}

export const InstanceActions: React.FC<Props> = ({
  instance,
  keycloak,
  onSetInstanceState,
}) => {
  if (instance.state === "terminated") return null;
  return (
    <DescriptionList>
      <DescriptionListGroup>
        <InstanceModal
          buttonType={ButtonType.edit}
          serviceName={instance.service_entity}
          instance={instance}
          keycloak={keycloak}
        />
      </DescriptionListGroup>
      <DescriptionListGroup>
        <InstanceModal
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
        <ResourceModal instance={instance} keycloak={keycloak} />
      </DescriptionListGroup>
      <DescriptionListGroup>
        <SetStateAction
          id={instance.id}
          environment={instance.environment}
          targets={instance.instanceSetStateTargets}
          onSetInstanceState={onSetInstanceState}
        />
      </DescriptionListGroup>
    </DescriptionList>
  );
};
