import { Dropdown, DropdownItem, DropdownToggle } from "@patternfly/react-core";
import { CaretDownIcon, CheckIcon } from "@patternfly/react-icons";
import React from "react";
import { useState } from "react";

interface Props {
  pageSize: number;
  setPageSize: (pageSize: number) => void;
}
export const PageSizeSelector: React.FC<Props> = ({
  pageSize,
  setPageSize,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (event, selection) => {
    setPageSize(selection);
    setIsOpen(false);
  };
  const onToggle = (isOpen) => {
    setIsOpen(isOpen);
  };
  const dropdownItems = [5, 10, 20, 50, 100].map((size) => (
    <DropdownItem
      key={size}
      value={size}
      onClick={(event) => onSelect(event, size)}
    >
      {size}
      {pageSize === size && <CheckIcon className="page-size-selector-icon" />}
    </DropdownItem>
  ));
  return (
    <Dropdown
      isOpen={isOpen}
      aria-label="page size selection"
      isPlain
      dropdownItems={dropdownItems}
      toggle={
        <DropdownToggle onToggle={onToggle} toggleIndicator={null}>
          <CaretDownIcon />
        </DropdownToggle>
      }
    />
  );
};
