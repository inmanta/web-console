import React from 'react';
import { ContextSelector, ContextSelectorItem } from '@patternfly/react-core';
import { IStoreModel } from '@app/Models/core-models';
import { useStoreDispatch } from 'easy-peasy';

export const EnvironmentSelector = (props: {items: string[]}) => {
  const items = props.items;
  const [open, setOpen] = React.useState(false);
  const [filteredItems, setFilteredItems] = React.useState(items);
  const [searchValue, setSearchValue] = React.useState('');
  const [selected, setSelected] = React.useState();
  const dispatch = useStoreDispatch<IStoreModel>();

  const onToggle = (event?: any, isOpen?: any) => {
    setOpen(isOpen);
  };

  const onSelect = (event: any, value: any) => {
    setOpen(!open);
    setSelected(value);
    const projectAndEnvironment = value.split('/').map(part => part.trim());
    dispatch.projects.selectProjectAndEnvironment({project: projectAndEnvironment[0], environment: projectAndEnvironment[1]});
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
    setFilteredItems(items)
  }, [items]);

  const filterItems = () => {
    const filtered =
      searchValue === ''
        ? items
        : items.filter(str => str.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1);
    setFilteredItems(filtered || []);
  };
  return (
    <ContextSelector
      toggleText={selected ? selected : "Select a project"}
      onSearchInputChange={onSearchInputChange}
      isOpen={open}
      searchInputValue={searchValue}
      onToggle={onToggle}
      onSelect={onSelect}
      onSearchButtonClick={onSearchButtonClick}
      screenReaderLabel="Selected Project:"
      searchButtonAriaLabel="Filter Projects"
    >
      {
        filteredItems.map((item, index) => (
        <ContextSelectorItem  {...{ role: "menuitem" }} key={index}>{item}</ContextSelectorItem>
      ))}

    </ContextSelector>
  );
}
