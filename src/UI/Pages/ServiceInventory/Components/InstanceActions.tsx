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
import { HistoryIcon, ToolsIcon, PortIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";
import { ButtonWithCursorHandling } from "@/UI/Components";
import { Routing } from "@/UI/Routing";

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
            pathname: Routing.getUrl("Diagnose", {
              service: instance.service_entity,
              instance: instance.id,
            }),
            search: location.search,
          }}
        >
          <ButtonWithCursorHandling
            isBlock
            variant="tertiary"
            isDisabled={diagnoseDisabled}
          >
            <ToolsIcon /> {words("inventory.statustab.diagnose")}
          </ButtonWithCursorHandling>
        </Link>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <Link
          to={{
            pathname: Routing.getUrl("History", {
              service: instance.service_entity,
              instance: instance.id,
            }),
            search: location.search,
          }}
        >
          <Button isBlock>
            <HistoryIcon /> {words("inventory.statusTab.history")}
          </Button>
        </Link>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <Link
          to={{
            pathname: Routing.getUrl("Events", {
              service: instance.service_entity,
              instance: instance.id,
            }),
            search: location.search,
          }}
        >
          <Button isBlock variant="secondary">
            <PortIcon /> {words("inventory.statusTab.events")}
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
