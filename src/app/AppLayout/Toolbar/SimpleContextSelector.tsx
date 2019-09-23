import React from 'react';
import { ContextSelector, ContextSelectorItem } from '@patternfly/react-core';

export class SimpleContextSelector extends React.Component<{}, { filteredItems: string[], isOpen: boolean, selected: any, searchValue: string }> {
  private items: string[];
  private onToggle: (event?: any, isOpen?: any) => void;
  private onSelect: (event: any, value: any) => void;
  private onSearchInputChange: (value: any) => void;
  private onSearchButtonClick: (event: any) => void;
  constructor(props) {
    super(props);
    this.items = [
      'SD-WAN Testing',
      'SD-WAN Production',
      'Secure Internet Testing',
      'Secure Internet Production'
    ];

    this.state = {
      filteredItems: this.items,
      isOpen: false,
      searchValue: '',
      selected: this.items[0]
    };

    this.onToggle = (event, isOpen) => {
      this.setState({
        isOpen
      });
    };

    this.onSelect = (event, value) => {
      this.setState({
        isOpen: !this.state.isOpen,
        selected: value,
      });
    };

    this.onSearchInputChange = value => {
      this.setState({ searchValue: value });
    };

    this.onSearchButtonClick = event => {
      const filtered =
        this.state.searchValue === ''
          ? this.items
          : this.items.filter(str => str.toLowerCase().indexOf(this.state.searchValue.toLowerCase()) !== -1);

      this.setState({ filteredItems: filtered || [] });
    };
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
}
