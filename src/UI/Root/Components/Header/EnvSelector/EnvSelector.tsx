import React, { ReactNode, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  ContextSelector,
  ContextSelectorFooter,
  ContextSelectorItem,
  Flex,
  FlexItem,
  Tooltip,
} from "@patternfly/react-core";
import { words } from "@/UI";
import { DependencyContext } from "@/UI/Dependency";

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
  const { routeManager } = useContext(DependencyContext);
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
              <Tooltip content={words("home.navigation.tooltip")}>
                <Link to={routeManager.getUrl("Home", undefined)}>
                  <Button variant="primary">
                    {words("home.navigation.button")}{" "}
                  </Button>
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
