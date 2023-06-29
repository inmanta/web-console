import React, { useContext } from "react";
import {
  Button,
  DescriptionList,
  DescriptionListGroup,
} from "@patternfly/react-core";
import { HistoryIcon, ToolsIcon, PortIcon } from "@patternfly/react-icons";
import { ButtonWithCursorHandling, Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { ServiceInstanceForAction } from "@/UI/Presenters";
import { words } from "@/UI/words";
import * as configFile from "../../../../config";
import { DeleteModal } from "./DeleteModal";
import { SetStateAction } from "./SetStateAction";

export interface InstanceActionsProps {
  instance: ServiceInstanceForAction;
  editDisabled: boolean;
  deleteDisabled: boolean;
  diagnoseDisabled: boolean;
}

export const InstanceActions: React.FC<InstanceActionsProps> = ({
  instance,
  editDisabled,
  deleteDisabled,
  diagnoseDisabled,
}) => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <DescriptionList>
      <DescriptionListGroup>
        {Object(configFile).hasOwnProperty("features") &&
          configFile.features.includes("instanceComposer") && (
            <Link
              pathname={routeManager.getUrl("InstanceComposerEditor", {
                service: instance.service_entity,
                instance: instance.id,
              })}
              isDisabled={editDisabled}
            >
              <ButtonWithCursorHandling
                isBlock
                variant="primary"
                isDisabled={editDisabled}
              >
                <ToolsIcon /> {words("inventory.instanceComposer.editButton")}
              </ButtonWithCursorHandling>
            </Link>
          )}
      </DescriptionListGroup>
      <DescriptionListGroup>
        <Link
          pathname={routeManager.getUrl("EditInstance", {
            service: instance.service_entity,
            instance: instance.id,
          })}
          isDisabled={editDisabled}
        >
          <ButtonWithCursorHandling
            isBlock
            variant="secondary"
            isDisabled={editDisabled}
          >
            <ToolsIcon /> {words("inventory.editInstance.button")}
          </ButtonWithCursorHandling>
        </Link>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DeleteModal
          isDisabled={deleteDisabled}
          service_entity={instance.service_entity}
          instance_identity={
            instance.service_identity_attribute_value ?? instance.id
          }
          id={instance.id}
          version={instance.version}
        />
      </DescriptionListGroup>
      <DescriptionListGroup>
        <Link
          pathname={routeManager.getUrl("Diagnose", {
            service: instance.service_entity,
            instance: instance.id,
          })}
          isDisabled={diagnoseDisabled}
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
          pathname={routeManager.getUrl("History", {
            service: instance.service_entity,
            instance: instance.id,
          })}
        >
          <Button isBlock>
            <HistoryIcon /> {words("inventory.statusTab.history")}
          </Button>
        </Link>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <Link
          pathname={routeManager.getUrl("Events", {
            service: instance.service_entity,
            instance: instance.id,
          })}
        >
          <Button isBlock variant="secondary">
            <PortIcon /> {words("inventory.statusTab.events")}
          </Button>
        </Link>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <SetStateAction
          service_entity={instance.service_entity}
          id={instance.id}
          instance_identity={
            instance.service_identity_attribute_value ?? instance.id
          }
          version={instance.version}
          targets={instance.instanceSetStateTargets}
        />
      </DescriptionListGroup>
    </DescriptionList>
  );
};
