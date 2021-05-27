import { ServiceModel } from "@/Core";
import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
} from "@patternfly/react-core";
import React, { useState } from "react";
import { CatalogDataList } from "./CatalogDataList";
import { DrawerPanel } from "./DrawerPanel";

interface Props {
  services: ServiceModel[];
  environmentId: string;
  serviceCatalogUrl: string;
  keycloak?: Keycloak.KeycloakInstance;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  dispatch?: (data) => any;
}

export const CatalogDrawer: React.FC<Props> = ({
  services,
  environmentId,
  serviceCatalogUrl,
  keycloak,
  dispatch,
}) => {
  const servicesById = services.reduce((acc, curr) => {
    acc[curr.name] = curr;
    return acc;
  }, {});
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const [selectedDataListItemId, setSelectedDataListItemId] = useState("");
  const panelContent = selectedDataListItemId ? (
    <DrawerPanel
      onCloseDrawer={() => setIsDrawerExpanded(false)}
      serviceName={selectedDataListItemId}
      summary={servicesById[selectedDataListItemId].instance_summary}
    />
  ) : undefined;
  return (
    <Drawer isExpanded={isDrawerExpanded}>
      <DrawerContent panelContent={panelContent}>
        <DrawerContentBody>
          <CatalogDataList
            services={servicesById}
            environmentId={environmentId}
            serviceCatalogUrl={serviceCatalogUrl}
            keycloak={keycloak}
            dispatch={dispatch}
            onSelectDataListItem={(id) => {
              setSelectedDataListItemId(id);
              setIsDrawerExpanded(true);
            }}
            selectedDataListItemId={selectedDataListItemId}
          />
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
