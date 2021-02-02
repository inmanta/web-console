import React from "react";
import { ContextSelector, ContextSelectorItem } from "@patternfly/react-core";
import { StoreModel } from "@/UI/Store";
import { useStoreDispatch, useStoreState, State } from "easy-peasy";

export interface IEnvironmentSelectorItem {
  displayName: string;
  projectId: string;
  environmentId?: string;
}

interface Props {
  items: IEnvironmentSelectorItem[];
}

export const EnvironmentSelector: React.FC<Props> = (props) => {
  const items = props.items;
  const environmentNames = items.map((item) => item.displayName);
  const [open, setOpen] = React.useState(false);
  const [filteredItems, setFilteredItems] = React.useState(environmentNames);
  const [searchValue, setSearchValue] = React.useState("");
  const store = useStoreState((state: State<StoreModel>) => state.projects);
  const selectedProject = store.projects.getSelectedProject;
  let selectedProjectName = "undefined / undefined";
  if (selectedProject && store.environments.getSelectedEnvironment) {
    selectedProjectName =
      selectedProject.name +
      " / " +
      store.environments.getSelectedEnvironment.name;
  }
  const dispatch = useStoreDispatch<StoreModel>();

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const onToggle = (event?: any, isOpen?: any) => {
    setOpen(isOpen);
  };

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const onSelect = (event: any, value: any) => {
    setOpen(!open);
    const matchingEnvItem = items.find(
      (envItem) => envItem.displayName === value
    );
    if (matchingEnvItem && matchingEnvItem.environmentId) {
      dispatch.projects.selectProjectAndEnvironment({
        environment: matchingEnvItem.environmentId,
        project: matchingEnvItem.projectId,
      });
    }
  };

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const onSearchInputChange = (value: any) => {
    setSearchValue(value);
  };

  const onSearchButtonClick = () => {
    filterItems();
  };

  React.useEffect(() => {
    filterItems();
  }, [searchValue]);

  React.useEffect(() => {
    setFilteredItems(environmentNames);
  }, [items]);

  const filterItems = () => {
    const filtered =
      searchValue === ""
        ? environmentNames
        : environmentNames.filter(
            (envName) =>
              envName.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1
          );
    setFilteredItems(filtered || []);
  };
  return (
    <ContextSelector
      toggleText={selectedProjectName}
      onSearchInputChange={onSearchInputChange}
      isOpen={open}
      searchInputValue={searchValue}
      onToggle={onToggle}
      onSelect={onSelect}
      onSearchButtonClick={onSearchButtonClick}
      screenReaderLabel="Selected Project:"
      searchButtonAriaLabel="Filter Projects"
    >
      {filteredItems.map((item, index) => (
        <ContextSelectorItem {...{ role: "menuitem" }} key={index}>
          {item}
        </ContextSelectorItem>
      ))}
    </ContextSelector>
  );
};
