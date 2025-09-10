import React, { useState } from "react";
import { Dropdown, DropdownList, MenuToggle, MenuToggleElement } from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { DiscoveredResourceLink } from ".";

interface Props {
  managedResourceUri: string | null;
  discoveryResourceUri: string | null;
}

export const ActionsDropdown: React.FC<Props> = ({ managedResourceUri, discoveryResourceUri }) => {
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
          isDisabled={!managedResourceUri && !discoveryResourceUri}
          icon={<EllipsisVIcon />}
        />
      )}
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      onSelect={() => setIsOpen(false)}
      popperProps={{ position: "right" }}
    >
      <DropdownList>
        {managedResourceUri && (
          <DiscoveredResourceLink resourceUri={managedResourceUri} resourceType="managed" />
        )}
        {discoveryResourceUri && (
          <DiscoveredResourceLink resourceUri={discoveryResourceUri} resourceType="discovery" />
        )}
      </DropdownList>
    </Dropdown>
  );
};
