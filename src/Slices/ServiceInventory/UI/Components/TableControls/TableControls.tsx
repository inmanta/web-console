import React, { useContext, useState } from 'react';
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
} from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { ServiceModel, ServiceInstanceParams } from '@/Core';
import { Link } from '@/UI/Components';
import { DependencyContext } from '@/UI/Dependency';
import { words } from '@/UI/words';
import { FilterWidget } from '@S/ServiceInventory/UI/Components/FilterWidget';

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

  const composerEnabled = featureManager.isComposerEnabled();

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
      splitButtonItems={[
        <Link
          key="main-action"
          pathname={routeManager.getUrl('CreateInstance', {
            service: serviceName,
          })}
          search={location.search}
          variant="plain"
        >
          <MenuToggleAction
            aria-label="add-instance-button"
            id="add-instance-button"
          >
            <PlusIcon /> {words('inventory.addInstance.button')}
          </MenuToggleAction>
        </Link>,
      ]}
      aria-label="AddInstanceToggle"
    />
  );

  return (
    <Toolbar clearAllFilters={() => setFilter({})}>
      <ToolbarContent>
        <FilterWidget filter={filter} setFilter={setFilter} states={states} />
        <ToolbarGroup align={{ default: 'alignEnd' }}>
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
                    pathname={routeManager.getUrl('InstanceComposer', {
                      service: serviceName,
                    })}
                    search={location.search}
                  >
                    <DropdownItem
                      id="add-instance-composer-button"
                      icon={<PlusIcon />}
                    >
                      {words('inventory.addInstance.composerButton')}
                    </DropdownItem>
                  </Link>
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
          ) : (
            <ToolbarItem>
              <Link
                pathname={routeManager.getUrl('CreateInstance', {
                  service: serviceName,
                })}
                search={location.search}
              >
                <Button icon={<PlusIcon />} id="add-instance-button">
                  {words('inventory.addInstance.button')}
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
