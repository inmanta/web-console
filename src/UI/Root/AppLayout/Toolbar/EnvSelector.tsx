import { words } from "@/UI";
import { getUrl } from "@/UI/Routing";
import {
  Button,
  ContextSelector,
  ContextSelectorFooter,
  ContextSelectorItem,
  Flex,
  FlexItem,
  Tooltip,
} from "@patternfly/react-core";
import { HomeIcon } from "@patternfly/react-icons";
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";

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
      footer={
        <ContextSelectorFooter>
          <Flex justifyContent={{ default: "justifyContentFlexEnd" }}>
            <FlexItem>
              <Tooltip content={words("home.navigation")}>
                <Link to={getUrl("Home", undefined)}>
                  <Button icon={<HomeIcon />} variant="link" />
                </Link>
              </Tooltip>
            </FlexItem>
          </Flex>
        </ContextSelectorFooter>
      }
    >
      {items.map((item, index) => (
        <ContextSelectorItem {...{ role: "menuitem" }} key={index}>
          {item}
        </ContextSelectorItem>
      ))}
    </ContextSelector>
  );
};
