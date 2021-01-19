import React from "react";
import { KeycloakInstance } from "keycloak-js";
import { ButtonType, InstanceModal } from "@app/ServiceInventory/InstanceModal";
import { DiagnosticsModal } from "@app/ServiceInventory/DiagnosticsModal";
import { ServiceInstanceForAction } from "./Presenters/ActionPresenter";

interface Props {
  instance: ServiceInstanceForAction;
  keycloak?: KeycloakInstance;
}

export const InstanceActions: React.FC<Props> = ({ instance, keycloak }) => {
  if (instance.state === "terminated") return null;
  return (
    <div>
      <InstanceModal
        buttonType={ButtonType.edit}
        serviceName={instance.service_entity}
        instance={instance}
        keycloak={keycloak}
      />
      <span className="pf-u-pr-xl pf-u-pl-xl" />
      <InstanceModal
        buttonType={ButtonType.delete}
        serviceName={instance.service_entity}
        instance={instance}
        keycloak={keycloak}
      />
      <DiagnosticsModal
        serviceName={instance.service_entity}
        instance={instance}
        keycloak={keycloak}
      />
    </div>
  );
};
