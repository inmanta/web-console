import React from "react";
import { KeycloakInstance } from "keycloak-js";
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
import { HistoryIcon, ToolsIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";

export interface InstanceActionsProps {
  instance: ServiceInstanceForAction;
  keycloak?: KeycloakInstance;
  editDisabled: boolean;
  deleteDisabled: boolean;
  diagnoseDisabled: boolean;
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
  diagnoseDisabled,
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
        <Link
          to={{
            pathname: `/lsm/catalog/${instance.service_entity}/inventory/${instance.id}/diagnose`,
            search: location.search,
          }}
        >
          <Button
            isBlock
            variant="tertiary"
            isDisabled={diagnoseDisabled}
            style={diagnoseDisabled ? { cursor: "not-allowed" } : {}}
          >
            <ToolsIcon /> {words("inventory.statustab.diagnose")}
          </Button>
        </Link>
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
