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
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  serviceName: string;
}

/**
 * The AddInstanceButton component for the Service Inventory page.
 *
 * Renders the "Add instance" action. When the composer is enabled it is a split button that
 * combines the plain create route with a dropdown offering the composer route; otherwise it is
 * a plain button linking to the create route.
 *
 * @Props {Props} - Component props.
 *  @prop {string} serviceName - The name of the service, used to build the create/composer routes.
 *
 * @returns {React.ReactElement} The rendered add-instance action.
 */
export const AddInstanceButton: React.FC<Props> = ({ serviceName }) => {
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

  if (!composerEnabled) {
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
  );
};
