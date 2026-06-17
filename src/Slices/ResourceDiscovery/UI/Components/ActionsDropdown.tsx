import React, { useState } from "react";
import { Dropdown, DropdownList, MenuToggle, MenuToggleElement } from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { DiscoveredResourceLink } from ".";

interface Props {
  managedResourceId: string | null;
  discoveryResourceId: string | null;
}

/**
 * Dropdown component to display the actions for a discovered resource
 * The dropdown contains two links to the managed and discovery resources if they are present.
 * The dropdown is disabled if both managed and discovery resources are not present.
 *
 * @Props {Props} - The props of the component
 *  @prop {string | null} managedResourceId - ID of the managed resource
 *  @prop {string | null} discoveryResourceId - ID of the discovery resource
 *
 * @returns {React.FC} ActionsDropdown component
 */
export const ActionsDropdown: React.FC<Props> = ({ managedResourceId, discoveryResourceId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Dropdown
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          aria-label="actions-toggle"
          variant="plain"
          onClick={onToggleClick}
          isExpanded={isOpen}
          isDisabled={!managedResourceId && !discoveryResourceId}
          icon={<EllipsisVIcon />}
        />
      )}
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      onSelect={() => setIsOpen(false)}
      popperProps={{ position: "right" }}
    >
      <DropdownList>
        {managedResourceId && (
          <DiscoveredResourceLink resourceId={managedResourceId} resourceType="managed" />
        )}
        {discoveryResourceId && (
          <DiscoveredResourceLink resourceId={discoveryResourceId} resourceType="discovery" />
        )}
      </DropdownList>
    </Dropdown>
  );
};
