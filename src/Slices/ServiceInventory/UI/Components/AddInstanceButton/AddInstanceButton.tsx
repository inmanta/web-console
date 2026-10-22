import React, { useContext, useState } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleAction,
  MenuToggleElement,
} from "@patternfly/react-core";
import { PlusIcon } from "@patternfly/react-icons";
import { Link } from "@/UI/Components/Link";
import { DependencyContext, useContributions } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  serviceName: string;
}

/**
 * The AddInstanceButton component for the Service Inventory page.
 *
 * Renders the "Add instance" action. When features contribute other ways to add an instance
 * (the `inventory.addInstance.actions` extension point, e.g. the composer), it is a split button
 * that combines the plain create route with a dropdown offering those; otherwise it is a plain
 * button linking to the create route.
 *
 * @Props {Props} - Component props.
 *  @prop {string} serviceName - The name of the service, used to build the create routes.
 *
 * @returns {React.ReactElement} The rendered add-instance action.
 */
export const AddInstanceButton: React.FC<Props> = ({ serviceName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { routeManager, orchestratorProvider } = useContext(DependencyContext);

  const actions = useContributions("inventory.addInstance.actions").filter(
    ({ isVisible }) => isVisible === undefined || isVisible(orchestratorProvider)
  );
  const context = { service: serviceName };

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

  if (actions.length === 0) {
    return (
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
    );
  }

  return (
    <Dropdown
      isOpen={isOpen}
      toggle={toggleMenu}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
    >
      <DropdownList>
        {actions.map(({ id, label, icon: Icon, getUrl, isDisabled }) => {
          const disabled = isDisabled?.(context) ?? false;

          return (
            <Link
              variant="plain"
              key={id}
              pathname={getUrl(routeManager, context)}
              search={location.search}
              isDisabled={disabled}
            >
              <DropdownItem id={id} icon={<Icon />} isDisabled={disabled}>
                {label}
              </DropdownItem>
            </Link>
          );
        })}
      </DropdownList>
    </Dropdown>
  );
};
