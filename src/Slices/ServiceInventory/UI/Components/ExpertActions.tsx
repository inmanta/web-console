import React from "react";
import { DescriptionList, DescriptionListGroup } from "@patternfly/react-core";
import { ServiceInstanceForAction } from "@/UI/Presenters";
import { ForceStateAction } from "./ForceStateAction";

export interface InstanceActionsProps {
  instance: ServiceInstanceForAction;
  targets: string[];
}

export const ExpertActions: React.FC<InstanceActionsProps> = ({
  instance,
  targets,
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
          targets={targets}
        />
      </DescriptionListGroup>
    </DescriptionList>
  );
};
