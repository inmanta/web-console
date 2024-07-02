import React, { useContext } from "react";
import { Panel } from "@patternfly/react-core";
import { Config, VersionedServiceInstanceIdentifier } from "@/Core";
import { ConfigSectionContent } from "@/Slices/ServiceInventory/UI/Tabs/ConfigSectionContent";
import { InstanceContext } from "../../Core/Context";

/**
 * The ConfigSection Component
 *
 * Displays a collapsible section containing the editable config if there's a config available.
 *
 * @note This component requires the ServiceInstanceDetails context to exist in one of its parents.
 *
 * @returns {React.FC | null} A React Component displaying the ConfigSection or null
 */
export const ConfigSection: React.FC = () => {
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
        <ConfigSectionContent
          serviceInstanceIdentifier={serviceInstanceIdentifier}
        />
      </Panel>
    )
  );
};
