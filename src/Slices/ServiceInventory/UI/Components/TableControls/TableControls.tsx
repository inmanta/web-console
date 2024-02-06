import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  ToolbarContent,
  MenuToggle,
  MenuToggleAction,
  Dropdown,
  MenuToggleElement,
  MenuItem,
  DropdownList,
  DropdownItem,
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
  showInstanceComposer: boolean;
}

export const TableControls: React.FC<Props> = ({
  serviceName,
  filter,
  setFilter,
  service,
  paginationWidget,
  showInstanceComposer,
}) => {
  const { routeManager } = useContext(DependencyContext);

  const { service_identity, service_identity_display_name } = service;
  const identityAttribute =
    service_identity && service_identity_display_name
      ? { key: service_identity, pretty: service_identity_display_name }
      : undefined;
  const states = service.lifecycle.states.map((state) => state.name).sort();

  const [isOpen, setIsOpen] = useState(false);

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
          <Dropdown
            onSelect={() => setIsOpen(false)}
            onOpenChange={(open: boolean) => setIsOpen(open)}
            isOpen={isOpen}
            toggle={(toggleref: React.Ref<MenuToggleElement>) => (
              <MenuToggle
                aria-label="CreateDropdown"
                ref={toggleref}
                onClick={(open) => setIsOpen(open)}
                isExpanded={isOpen}
                variant="secondary"
                splitButtonOptions={{
                  variant: "action",
                  items: [
                    <MenuToggleAction
                      id="split-button-action-primary-example-with-toggle-button"
                      key="split-action-primary"
                      aria-label="Action"
                    >
                      <MenuItem>
                        <Link
                          to={{
                            pathname: routeManager.getUrl("CreateInstance", {
                              service: serviceName,
                            }),
                            search: location.search,
                          }}
                        >
                          <PlusIcon /> {words("inventory.addInstance.button")}
                        </Link>
                      </MenuItem>
                    </MenuToggleAction>,
                  ],
                }}
              />
            )}
          >
            <DropdownList>
              {showInstanceComposer && (
                <DropdownItem>
                  <Link
                    to={{
                      pathname: routeManager.getUrl("InstanceComposer", {
                        service: serviceName,
                      }),
                      search: location.search,
                    }}
                  >
                    {words("inventory.addInstance.composerButton")}
                  </Link>
                </DropdownItem>
              )}
              <DropdownItem>
                <Link
                  to={{
                    pathname: routeManager.getUrl("CreateInstanceEditor", {
                      service: serviceName,
                    }),
                    search: location.search,
                  }}
                >
                  {words("inventory.create.editor.button")}
                </Link>
              </DropdownItem>
            </DropdownList>
          </Dropdown>
          {/* {showInstanceComposer && (
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
          </ToolbarItem> */}
        </ToolbarGroup>
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
