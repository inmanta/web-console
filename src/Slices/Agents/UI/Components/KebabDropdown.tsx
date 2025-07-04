import React, { useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { DeployAgentsAction, useDeployAgents } from "@/Data/Queries";
import { words } from "@/UI";

interface Props {
  name: string;
  paused: boolean;
}

/**
 * The KebabDropdown Component
 *
 * This component provides a dropdown menu with actions for agent management.
 * It allows users to deploy or repair agents through a kebab-style dropdown menu.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} name - The name of the agent to perform actions on
 *  @prop {boolean} paused - Whether the agent is paused, which disables action buttons
 *
 * @returns {React.FC<Props>} A React Component that displays a dropdown menu with agent actions
 */
export const KebabDropdown: React.FC<Props> = ({ name, paused }) => {
  const { mutate } = useDeployAgents();
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Dropdown
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          aria-label="repair-deploy-dropdown"
          variant="plain"
          onClick={onToggleClick}
          isExpanded={isOpen}
          icon={<EllipsisVIcon />}
        />
      )}
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      popperProps={{ position: "center" }}
      onSelect={() => setIsOpen(false)}
    >
      <DropdownList>
        <DropdownItem
          key="deploy"
          isDisabled={paused}
          onClick={() =>
            mutate({
              method: DeployAgentsAction.deploy,
              agents: [name],
            })
          }
          component="button"
        >
          {words("agents.actions.deploy")}
        </DropdownItem>
        <DropdownItem
          key="repair"
          isDisabled={paused}
          onClick={() =>
            mutate({
              method: DeployAgentsAction.repair,
              agents: [name],
            })
          }
          component="button"
        >
          {words("agents.actions.repair")}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};
