import React from 'react';
import { ContextSelector, ContextSelectorItem } from '@patternfly/react-core';

export class EnvironmentSelector extends React.Component<{}, { filteredItems: string[], isOpen: boolean, selected: any, searchValue: string }> {
  private items: string[];
  constructor(props) {
    super(props);
    this.items = [
      'SD-WAN - Testing',
      'SD-WAN - Production',
      'Secure Internet - Testing',
      'Secure Internet - Production'
    ];

    this.state = {
      filteredItems: this.items,
      isOpen: false,
      searchValue: '',
      selected: this.items[0]
    };
    this.onToggle = this.onToggle.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onSearchInputChange = this.onSearchInputChange.bind(this);
    this.onSearchButtonClick = this.onSearchButtonClick.bind(this);
  }
  public render() {
    const { isOpen, selected, searchValue, filteredItems } = this.state;
    return (
      <ContextSelector
        toggleText={selected}
        onSearchInputChange={this.onSearchInputChange}
        isOpen={isOpen}
        searchInputValue={searchValue}
        onToggle={this.onToggle}
        onSelect={this.onSelect}
        onSearchButtonClick={this.onSearchButtonClick}
        screenReaderLabel="Selected Project:"
        searchButtonAriaLabel="Filter Projects"
      >
        {filteredItems.map((item, index) => (
          <ContextSelectorItem  {...{ role: "menuitem" }} key={index}>{item}</ContextSelectorItem>
        ))}

      </ContextSelector>
    );
  }
  private onToggle(event?: any, isOpen?: any): void {
    this.setState({
      isOpen
    });
  };;
  private onSelect(event: any, value: any): void {
    this.setState({
      isOpen: !this.state.isOpen,
      selected: value,
    });
  };
  private onSearchInputChange(value: any): void {
    this.setState({ searchValue: value }, this.filterItems);
  };
  private onSearchButtonClick(event: any): void {
    this.filterItems();
  };;
  private filterItems(): void {
    const filtered =
      this.state.searchValue === ''
        ? this.items
        : this.items.filter(str => str.toLowerCase().indexOf(this.state.searchValue.toLowerCase()) !== -1);

    this.setState({ filteredItems: filtered || [] });
  };
  
}
