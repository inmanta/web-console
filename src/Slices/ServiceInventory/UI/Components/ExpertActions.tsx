import React from "react";
import { DescriptionList, DescriptionListGroup } from "@patternfly/react-core";
import { ServiceInstanceForAction } from "@/UI/Presenters";
import { ForceStateAction } from "./ForceStateAction";

export interface InstanceActionsProps {
  instance: ServiceInstanceForAction;
  possibleInstanceStates: string[];
}

export const ExpertActions: React.FC<InstanceActionsProps> = ({
  instance,
  possibleInstanceStates,
}) => {
  return (
    <DescriptionList>
      <DescriptionListGroup>
        <ForceStateAction
          service_entity={instance.service_entity}
          id={instance.id}
          instance_identity={
            instance.service_identity_attribute_value ?? instance.id
          }
          version={instance.version}
          possibleInstanceStates={possibleInstanceStates}
        />
      </DescriptionListGroup>
    </DescriptionList>
  );
};
