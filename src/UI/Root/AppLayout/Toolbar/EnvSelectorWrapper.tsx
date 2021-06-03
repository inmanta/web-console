import { ProjectModel } from "@/Core";
import { flatMap } from "lodash";
import React, { ReactNode } from "react";
import { useState } from "react";
import { EnvSelector } from "./EnvSelector";

interface Props {
  projects: ProjectModel[];
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
  projects,
  onSelectEnvironment,
  defaultToggleText,
}) => {
  const selectorItems = flatMap(projects, (project) => {
    return project.environments.map((environment) => {
      const envSelectorItem: EnvironmentSelectorItem = {
        displayName: `${project.name} / ${environment.name}`,
        projectId: project.id,
        environmentId: environment.id,
      };
      return envSelectorItem;
    });
  });

  const environmentNames = selectorItems.map((item) => item.displayName);
  const [filteredItems, setFilteredItems] = useState(environmentNames);
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [toggleText, setToggleText] = useState(defaultToggleText);
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
