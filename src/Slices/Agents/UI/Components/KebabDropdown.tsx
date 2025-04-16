import React, { useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { useDeploy } from "@/Data/Managers/V2/Agents";
import { words } from "@/UI";

interface Props {
  name: string;
  paused: boolean;
}

export const KebabDropdown: React.FC<Props> = ({ name, paused }) => {
  const { mutate } = useDeploy();
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
              method: "Deploy",
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
              method: "Repair",
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
