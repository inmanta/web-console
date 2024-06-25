import React, { useContext, useState } from "react";
import { ExpandableSection } from "@patternfly/react-core";
import { Config, VersionedServiceInstanceIdentifier } from "@/Core";
import { ConfigTab } from "@/Slices/ServiceInventory/UI/Tabs/ConfigTab";
import { InstanceContext } from "../../Core/Context";

export const ConfigSection: React.FunctionComponent = () => {
  const { instance } = useContext(InstanceContext);

  const isConfigEmpty = (config: Config) => {
    return Object.keys(config).length === 0;
  };

  const [isExpanded, setIsExpanded] = useState(false);

  const onToggle = (_event: React.MouseEvent, isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  const serviceInstanceIdentifier: VersionedServiceInstanceIdentifier = {
    id: instance.id,
    service_entity: instance.service_entity,
    version: instance.version,
  };

  return (
    !isConfigEmpty && (
      <ExpandableSection
        toggleText={"Config"}
        onToggle={onToggle}
        isExpanded={isExpanded}
      >
        <ConfigTab serviceInstanceIdentifier={serviceInstanceIdentifier} />
      </ExpandableSection>
    )
  );
};
