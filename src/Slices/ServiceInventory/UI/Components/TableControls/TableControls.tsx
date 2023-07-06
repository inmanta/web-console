import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  ToolbarContent,
  Button,
} from "@patternfly/react-core";
import { PlusIcon } from "@patternfly/react-icons";
import { ServiceModel, ServiceInstanceParams } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { FilterWidget } from "@S/ServiceInventory/UI/Components/FilterWidget";

interface Props {
  serviceName: string;
  filter: ServiceInstanceParams.Filter;
  setFilter: (filter: ServiceInstanceParams.Filter) => void;
  service: ServiceModel;
  paginationWidget: React.ReactNode;
}

export const TableControls: React.FC<Props> = ({
  serviceName,
  filter,
  setFilter,
  service,
  paginationWidget,
}) => {
  const { routeManager } = useContext(DependencyContext);
  const { service_identity, service_identity_display_name } = service;
  const identityAttribute =
    service_identity && service_identity_display_name
      ? { key: service_identity, pretty: service_identity_display_name }
      : undefined;
  const states = service.lifecycle.states.map((state) => state.name).sort();
  return (
    <Toolbar clearAllFilters={() => setFilter({})}>
      <ToolbarContent>
        <FilterWidget
          filter={filter}
          setFilter={setFilter}
          states={states}
          identityAttribute={identityAttribute}
        />
        <ToolbarGroup alignment={{ default: "alignRight" }}>
          {globalThis.features !== undefined &&
            globalThis.features.includes("instanceComposer") && (
              <ToolbarItem>
                <Link
                  to={{
                    pathname: routeManager.getUrl("InstanceComposer", {
                      service: serviceName,
                    }),
                    search: location.search,
                  }}
                >
                  <Button id="add-instance-composer-button">
                    {words("inventory.addInstance.composerButton")}
                  </Button>
                </Link>
              </ToolbarItem>
            )}
          <ToolbarItem>
            <Link
              to={{
                pathname: routeManager.getUrl("CreateInstance", {
                  service: serviceName,
                }),
                search: location.search,
              }}
            >
              <Button id="add-instance-button">
                <PlusIcon /> {words("inventory.addInstance.button")}
              </Button>
            </Link>
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
