import React, { useState } from "react";
import styled from "styled-components";
import { Dropdown, DropdownItem, DropdownToggle } from "@patternfly/react-core";
import { CaretDownIcon, CheckIcon } from "@patternfly/react-icons";

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
      {pageSize === size && <StyledCheckIcon />}
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

const StyledCheckIcon = styled(CheckIcon)`
  align-self: center;
  width: auto;
  padding-left: var(--pf-global--spacer--sm);
  margin-left: auto;
  font-size: var(--pf-global--icon--FontSize--sm);
  color: var(--pf-global--active-color--100);
`;
