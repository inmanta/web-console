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
import { FilterToggleButton, Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  serviceName: string;
  paginationWidget: React.ReactNode;
  onToggleFilters: () => void;
  isDrawerExpanded: boolean;
  activeFilterCount: number;
}

/**
 * The TableControls component for the Service Inventory page.
 *
 * Renders the toolbar with the pagination widget, the filter toggle button that opens the
 * side-panel filter drawer, and the "Add instance" action (a split button with the composer
 * option when the composer is enabled).
 *
 * @Props {Props} - Component props.
 *  @prop {string} serviceName - The name of the service, used to build the create/composer routes.
 *  @prop {React.ReactNode} paginationWidget - The pagination widget.
 *  @prop {() => void} onToggleFilters - The function to toggle the filter drawer.
 *  @prop {boolean} isDrawerExpanded - Whether the filter drawer is expanded.
 *  @prop {number} activeFilterCount - The number of active filters.
 *
 * @returns {React.ReactElement} The rendered table controls.
 */
export const TableControls: React.FC<Props> = ({
  serviceName,
  paginationWidget,
  onToggleFilters,
  isDrawerExpanded,
  activeFilterCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { routeManager, orchestratorProvider } = useContext(DependencyContext);

  const composerEnabled = orchestratorProvider.isComposerEnabled();

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggleMenu = (ref: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={ref}
      variant="secondary"
      isExpanded={isOpen}
      onClick={onToggleClick}
      splitButtonItems={[
        <Link
          key="main-action"
          pathname={routeManager.getUrl("CreateInstance", {
            service: serviceName,
          })}
          search={location.search}
          variant="plain"
        >
          <MenuToggleAction aria-label="add-instance-button" id="add-instance-button">
            <PlusIcon /> {words("inventory.addInstance.button")}
          </MenuToggleAction>
        </Link>,
      ]}
      aria-label="AddInstanceToggle"
    />
  );

  return (
    <Toolbar>
      <ToolbarContent>
        <ToolbarGroup>
          {composerEnabled ? (
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
                    <DropdownItem id="add-instance-composer-button" icon={<PlusIcon />}>
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
                <Button icon={<PlusIcon />} id="add-instance-button">
                  {words("inventory.addInstance.button")}
                </Button>
              </Link>
            </ToolbarItem>
          )}
        </ToolbarGroup>
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
        <ToolbarItem>
          <FilterToggleButton
            onClick={onToggleFilters}
            isExpanded={isDrawerExpanded}
            activeFilterCount={activeFilterCount}
            label={words("inventory.filters")}
          />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
