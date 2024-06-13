import React, { useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { CopyIcon } from "@patternfly/react-icons";

interface Props {
  text: string;
  options: string[];
  tooltipContent: string;
  isDisabled?: boolean;
}

export const CopyMultiOptions: React.FC<Props> = ({
  options: values,
  tooltipContent,
  isDisabled,
  text,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    // eslint-disable-next-line no-console
    console.log("selected", value, tooltipContent);

    // copy value to clipboard

    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      onClick={onToggleClick}
      isDisabled={isDisabled}
      ref={toggleRef}
      variant="plain"
      isExpanded={isOpen}
      aria-label="Copy to clipboard"
    >
      {text} <CopyIcon />
    </MenuToggle>
  );

  return (
    <Dropdown isOpen={isOpen} onSelect={onSelect} toggle={toggle}>
      <DropdownList>
        {values.map((value, index) => (
          <DropdownItem key={index} value={value}>
            {value}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
};
