import React from "react";
import { Link, useLocation } from "react-router-dom";
import { HistoryIcon, ToolsIcon, PortIcon } from "@patternfly/react-icons";
import {
  Button,
  DescriptionList,
  DescriptionListGroup,
} from "@patternfly/react-core";
import { words } from "@/UI/words";
import { ButtonWithCursorHandling } from "@/UI/Components";
import { getUrl } from "@/UI/Routing";
import { AttributeModel } from "@/Core";
import { ServiceInstanceForAction } from "@/UI/Presenters";
import { EditInstanceModal } from "./EditInstanceModal";
import { DeleteModal } from "./DeleteModal";
import { SetStateAction } from "./SetStateAction";

export interface InstanceActionsProps {
  instance: ServiceInstanceForAction;
  editDisabled: boolean;
  deleteDisabled: boolean;
  diagnoseDisabled: boolean;
  attributeModels: AttributeModel[];
}

export const InstanceActions: React.FC<InstanceActionsProps> = ({
  instance,
  editDisabled,
  attributeModels,
  deleteDisabled,
  diagnoseDisabled,
}) => {
  const location = useLocation();
  if (instance.state === "terminated") return null;
  return (
    <DescriptionList>
      <DescriptionListGroup>
        <EditInstanceModal
          isDisabled={editDisabled}
          instance={instance}
          attributeModels={attributeModels}
        />
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DeleteModal
          isDisabled={deleteDisabled}
          service_entity={instance.service_entity}
          id={instance.id}
          version={instance.version}
        />
      </DescriptionListGroup>
      <DescriptionListGroup>
        <Link
          to={{
            pathname: getUrl("Diagnose", {
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
            pathname: getUrl("History", {
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
            pathname: getUrl("Events", {
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
          service_entity={instance.service_entity}
          id={instance.id}
          version={instance.version}
          targets={instance.instanceSetStateTargets}
        />
      </DescriptionListGroup>
    </DescriptionList>
  );
};
