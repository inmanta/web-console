import React, { useContext, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  KebabToggle,
} from "@patternfly/react-core/deprecated";
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
  return (
    <Dropdown
      toggle={<KebabToggle onToggle={() => setIsOpen(!isOpen)} />}
      isOpen={isOpen}
      isPlain
      onSelect={() => setIsOpen(false)}
      position="right"
      dropdownItems={[
        <DropdownItem
          key="deploy"
          isDisabled={paused}
          onClick={() => deploy([name])}
          component="button"
        >
          {words("agents.actions.deploy")}
        </DropdownItem>,
        <DropdownItem
          key="repair"
          isDisabled={paused}
          onClick={() => repair([name])}
          component="button"
        >
          {words("agents.actions.repair")}
        </DropdownItem>,
      ]}
    />
  );
};
