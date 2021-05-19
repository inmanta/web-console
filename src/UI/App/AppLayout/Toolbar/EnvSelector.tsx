import { ContextSelector, ContextSelectorItem } from "@patternfly/react-core";
import React, { ReactNode } from "react";

interface Props {
  searchValue: string;
  onSearchInputChange: (value: string) => void;
  items: string[];
  onSelect: (event, value: ReactNode) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleText: string;
}

export const EnvSelector: React.FC<Props> = ({
  searchValue,
  onSearchInputChange,
  items,
  onSelect,
  isOpen,
  setIsOpen,
  toggleText,
}) => {
  return (
    <ContextSelector
      toggleText={toggleText}
      onSearchInputChange={onSearchInputChange}
      isOpen={isOpen}
      searchInputValue={searchValue}
      onToggle={() => setIsOpen(!isOpen)}
      onSelect={onSelect}
      screenReaderLabel="Selected Project:"
      searchButtonAriaLabel="Filter Projects"
    >
      {items.map((item, index) => (
        <ContextSelectorItem {...{ role: "menuitem" }} key={index}>
          {item}
        </ContextSelectorItem>
      ))}
    </ContextSelector>
  );
};
