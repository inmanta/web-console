import React from 'react';
import { ContextSelector, ContextSelectorItem } from '@patternfly/react-core';
import { IStoreModel } from '@app/Models/CoreModels';
import { useStoreDispatch, useStoreState, State } from 'easy-peasy';

export const EnvironmentSelector = (props: { items: string[] }) => {
  const items = props.items;
  const [open, setOpen] = React.useState(false);
  const [filteredItems, setFilteredItems] = React.useState(items);
  const [searchValue, setSearchValue] = React.useState('');
  const store = useStoreState((state: State<IStoreModel>) => state.projects);
  const selectedProject = store.projects.getSelectedProject;
  let selectedProjectName = 'undefined / undefined';
  if (selectedProject && store.environments.getSelectedEnvironment) {
    selectedProjectName = selectedProject.name + ' / ' + store.environments.getSelectedEnvironment.name;
  }
  const dispatch = useStoreDispatch<IStoreModel>();

  const onToggle = (event?: any, isOpen?: any) => {
    setOpen(isOpen);
  };

  const onSelect = (event: any, value: any) => {
    setOpen(!open);
    const projectAndEnvironment = value.split('/').map(part => part.trim());
    dispatch.projects.selectProjectAndEnvironment({
      environment: projectAndEnvironment[1],
      project: projectAndEnvironment[0],
    });
  };
  const onSearchInputChange = (value: any) => {
    setSearchValue(value);
  };
  const onSearchButtonClick = (event: any) => {
    filterItems();
  };

  React.useEffect(() => {
    filterItems();
  }, [searchValue]);

  React.useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  const filterItems = () => {
    const filtered =
      searchValue === '' ? items : items.filter(str => str.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1);
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
        <ContextSelectorItem {...{ role: 'menuitem' }} key={index}>
          {item}
        </ContextSelectorItem>
      ))}
    </ContextSelector>
  );
};
