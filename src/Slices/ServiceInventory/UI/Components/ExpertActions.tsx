import React from "react";
import { DescriptionList, DescriptionListGroup } from "@patternfly/react-core";
import { ServiceInstanceForAction } from "@/UI/Presenters";
import { DestroyModal } from "./DestroyModal";
import { ForceStateAction } from "./ForceStateAction";

export interface InstanceActionsProps {
  instance: ServiceInstanceForAction;
}

export const ExpertActions: React.FC<InstanceActionsProps> = ({ instance }) => {
  return (
    <DescriptionList>
      <DescriptionListGroup>
        <DestroyModal
          service_entity={instance.service_entity}
          instance_identity={
            instance.service_identity_attribute_value ?? instance.id
          }
          id={instance.id}
          version={instance.version}
        />
      </DescriptionListGroup>
      <DescriptionListGroup>
        <ForceStateAction
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
