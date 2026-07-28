import React, { useState } from "react";
import { Dropdown, DropdownItem, DropdownList, MenuToggle } from "@patternfly/react-core";
import { words } from "@/UI/words";

export interface EnvironmentOption {
  id: string;
  name: string;
  projectName: string;
}

interface Props {
  options: EnvironmentOption[];
  onSelect: (environmentId: string) => void;
}

/**
 * The Orchestrator card's "Switch" trigger: a lightweight environment picker, reusing the same
 * data (useGetEnvironments/useGetProjects) and environmentHandler.set() navigation as the
 * header's own EnvSelector, but with its own minimal menu (no search/logout/dark-mode/manage-
 * projects extras — those are header-specific, not relevant to a quick-switch link on a card).
 */
export const EnvironmentSwitchMenu: React.FC<Props> = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={() => setIsOpen(false)}
      popperProps={{ position: "end" }}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          variant="plainText"
          onClick={() => setIsOpen(!isOpen)}
          isExpanded={isOpen}
        >
          {words("dashboardV2.environmentHealth.switch")} &gt;
        </MenuToggle>
      )}
    >
      <DropdownList>
        {options.map((option) => (
          <DropdownItem key={option.id} onClick={() => onSelect(option.id)}>
            {option.name} ({option.projectName || words("dashboardV2.environmentHealth.unknownProject")})
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
};
