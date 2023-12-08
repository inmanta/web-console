import React, { useContext, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { DependencyContext, words } from "@/UI";

interface Props {
  name: string;
  paused: boolean;
}

export const KebabDropdown: React.FC<Props> = ({ name, paused }) => {
  const { commandResolver } = useContext(DependencyContext);
  const deploy = commandResolver.useGetTrigger<"Deploy">({ kind: "Deploy" });
  const repair = commandResolver.useGetTrigger<"Repair">({ kind: "Repair" });
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
        >
          <EllipsisVIcon />
        </MenuToggle>
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
          onClick={() => deploy([name])}
          component="button"
        >
          {words("agents.actions.deploy")}
        </DropdownItem>
        <DropdownItem
          key="repair"
          isDisabled={paused}
          onClick={() => repair([name])}
          component="button"
        >
          {words("agents.actions.repair")}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};
