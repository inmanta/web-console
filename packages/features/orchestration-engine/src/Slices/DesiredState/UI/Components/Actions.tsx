import React, { useState } from "react";
import {
  Divider,
  Dropdown,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { ParsedNumber } from "@inmanta/web-console-core";
import { CompareAction } from "./CompareAction";
import { DeleteAction } from "./DeleteAction";
import { DryRunAction } from "./DryRunAction";
import { PromoteAction } from "./PromoteAction";

interface Props {
  version: ParsedNumber;
  isPromoteDisabled: boolean;
}

export const Actions: React.FC<Props> = ({ version, isPromoteDisabled }) => {
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
          icon={<EllipsisVIcon />}
        />
      )}
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      onSelect={() => setIsOpen(false)}
      popperProps={{ position: "right" }}
    >
      <DropdownList>
        <DeleteAction version={version} />
        <PromoteAction version={version} isDisabled={isPromoteDisabled} />
        <CompareAction version={Number(version)} />
        <Divider component="li" />
        <DryRunAction version={version} />
      </DropdownList>
    </Dropdown>
  );
};
