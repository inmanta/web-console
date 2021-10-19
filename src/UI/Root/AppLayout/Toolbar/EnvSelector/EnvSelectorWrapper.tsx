import React, { ReactNode, useEffect, useState } from "react";
import { EnvSelector } from "./EnvSelector";

interface Props {
  selectorItems: EnvironmentSelectorItem[];
  environmentNames: string[];
  onSelectEnvironment: (
    selectedProjectAndEnvironment: EnvironmentSelectorItem
  ) => void;
  defaultToggleText: string;
}

export interface EnvironmentSelectorItem {
  displayName: string;
  projectId: string;
  environmentId: string;
}

export const EnvSelectorWrapper: React.FC<Props> = ({
  selectorItems,
  onSelectEnvironment,
  defaultToggleText,
  environmentNames,
}) => {
  const [filteredItems, setFilteredItems] = useState(environmentNames);
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [toggleText, setToggleText] = useState(defaultToggleText);

  useEffect(() => {
    setFilteredItems(environmentNames);
    setToggleText(defaultToggleText);
    setSearchValue("");
  }, [environmentNames, defaultToggleText]);

  const filterItems = (value: string) => {
    const filtered =
      value === ""
        ? environmentNames
        : environmentNames.filter(
            (envName) =>
              envName.toLowerCase().indexOf(value.toLowerCase()) !== -1
          );
    return filtered;
  };

  const onSearchInputChange = (value: string) => {
    setSearchValue(value);
    setFilteredItems(filterItems(value));
  };

  const onSelect = (event, value: ReactNode) => {
    setIsOpen(!isOpen);
    // The onSelect value is the selected ReactNode. In this case, the selection items are just strings.
    const valAsString = value as string;

    const matchingEnvItem = selectorItems.find(
      (envItem) => envItem.displayName === value
    );
    if (matchingEnvItem) {
      setToggleText(valAsString);
      onSelectEnvironment(matchingEnvItem);
    }
  };
  return (
    <EnvSelector
      items={filteredItems}
      searchValue={searchValue}
      onSearchInputChange={onSearchInputChange}
      onSelect={onSelect}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      toggleText={toggleText}
    />
  );
};
