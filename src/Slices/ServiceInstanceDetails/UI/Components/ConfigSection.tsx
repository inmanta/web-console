import React, { useContext } from "react";
import { Panel } from "@patternfly/react-core";
import { Config, VersionedServiceInstanceIdentifier } from "@/Core";
import { ConfigTab } from "@/Slices/ServiceInventory/UI/Tabs/ConfigTab";
import { InstanceContext } from "../../Core/Context";

export const ConfigSection: React.FunctionComponent = () => {
  const { instance } = useContext(InstanceContext);

  const isConfigEmpty = (config?: Config | null) => {
    return config && Object.keys(config).length === 0;
  };

  const serviceInstanceIdentifier: VersionedServiceInstanceIdentifier = {
    id: instance.id,
    service_entity: instance.service_entity,
    version: instance.version,
  };

  return (
    !isConfigEmpty(instance.config) && (
      <Panel variant="raised" aria-label="Config-Section">
        <ConfigTab serviceInstanceIdentifier={serviceInstanceIdentifier} />
      </Panel>
    )
  );
};
