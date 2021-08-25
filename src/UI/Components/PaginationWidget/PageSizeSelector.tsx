import React, { useState } from "react";
import styled from "styled-components";
import { Dropdown, DropdownItem, DropdownToggle } from "@patternfly/react-core";
import { CaretDownIcon, CheckIcon } from "@patternfly/react-icons";
import { PageSize } from "@/Core";

interface Props {
  currentPageSize: PageSize.Type;
  setPageSize: (pageSize: PageSize.Type) => void;
}

export const PageSizeSelector: React.FC<Props> = ({
  currentPageSize,
  setPageSize,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (pageSize: PageSize.Type) => {
    setPageSize(pageSize);
    setIsOpen(false);
  };

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const dropdownItems = PageSize.list.map((pageSize) => (
    <DropdownItem
      key={pageSize.value}
      value={pageSize.value}
      onClick={() => onSelect(pageSize)}
    >
      {pageSize.value}
      {PageSize.equals(currentPageSize, pageSize) && <StyledCheckIcon />}
    </DropdownItem>
  ));

  return (
    <Dropdown
      isOpen={isOpen}
      aria-label="page size selection"
      isPlain
      dropdownItems={dropdownItems}
      toggle={
        <DropdownToggle
          onToggle={onToggle}
          toggleIndicator={null}
          aria-label="Page Size Selector dropdown"
        >
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
