import React from "react";
import {
  CardFooter,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  ToolbarContent,
  Button,
} from "@patternfly/react-core";
import { words } from "@/UI/words";
import { ServiceModel, ServiceInstanceParams } from "@/Core";
import { Link } from "react-router-dom";
import { PlusIcon } from "@patternfly/react-icons";
import { FilterWidget } from "../FilterWidget";
import { Routing } from "@/UI/Routing";

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
  const { service_identity, service_identity_display_name } = service;
  const identityAttribute =
    service_identity && service_identity_display_name
      ? { key: service_identity, pretty: service_identity_display_name }
      : undefined;
  const states = service.lifecycle.states.map((state) => state.name).sort();
  return (
    <CardFooter>
      <Toolbar clearAllFilters={() => setFilter({})}>
        <ToolbarContent>
          <FilterWidget
            filter={filter}
            setFilter={setFilter}
            states={states}
            identityAttribute={identityAttribute}
          />
          <ToolbarItem variant="separator" />
          <ToolbarGroup>
            <ToolbarItem>
              <Link
                to={{
                  pathname: Routing.getUrl("CreateInstance", {
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
    </CardFooter>
  );
};
