import React, { useContext, useState } from "react";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  ToolbarContent,
  Button,
  MenuToggle,
  MenuToggleAction,
  Dropdown,
  MenuToggleElement,
  DropdownList,
  DropdownItem,
} from "@patternfly/react-core";
import { PlusIcon } from "@patternfly/react-icons";
import { ServiceModel, ServiceInstanceParams } from "@/Core";
import { Link } from "@/UI/Components";
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
  const [isOpen, setIsOpen] = useState(false);
  const { routeManager, featureManager } = useContext(DependencyContext);

  const composerEnabled =
    service.owner === null && featureManager.isComposerEnabled();

  const { service_identity, service_identity_display_name } = service;
  const identityAttribute =
    service_identity && service_identity_display_name
      ? { key: service_identity, pretty: service_identity_display_name }
      : undefined;
  const states = service.lifecycle.states.map((state) => state.name).sort();

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggleMenu = (ref: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={ref}
      variant="secondary"
      isExpanded={isOpen}
      onClick={onToggleClick}
      splitButtonOptions={{
        variant: "action",
        items: [
          <Link
            key="main-action"
            pathname={routeManager.getUrl("CreateInstance", {
              service: serviceName,
            })}
            search={location.search}
            variant="plain"
          >
            <MenuToggleAction
              aria-label="add-instance-button"
              id="add-instance-button"
            >
              <PlusIcon /> {words("inventory.addInstance.button")}
            </MenuToggleAction>
          </Link>,
        ],
      }}
      aria-label="AddInstanceToggle"
    />
  );

  return (
    <Toolbar clearAllFilters={() => setFilter({})}>
      <ToolbarContent>
        <FilterWidget
          filter={filter}
          setFilter={setFilter}
          states={states}
          identityAttribute={identityAttribute}
        />
        <ToolbarGroup align={{ default: "alignRight" }}>
          {composerEnabled && service.owner === null ? (
            <ToolbarItem>
              <Dropdown
                isOpen={isOpen}
                toggle={toggleMenu}
                onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
              >
                <DropdownList>
                  <Link
                    variant="plain"
                    key="add-instance-composer-button"
                    pathname={routeManager.getUrl("InstanceComposer", {
                      service: serviceName,
                    })}
                    search={location.search}
                  >
                    <DropdownItem id="add-instance-composer-button">
                      <PlusIcon />
                      {words("inventory.addInstance.composerButton")}
                    </DropdownItem>
                  </Link>
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
          ) : (
            <ToolbarItem>
              <Link
                pathname={routeManager.getUrl("CreateInstance", {
                  service: serviceName,
                })}
                search={location.search}
              >
                <Button id="add-instance-button">
                  <PlusIcon /> {words("inventory.addInstance.button")}
                </Button>
              </Link>
            </ToolbarItem>
          )}
        </ToolbarGroup>
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
