import React from 'react';
import { ContextSelector, ContextSelectorItem } from '@patternfly/react-core';

export class SimpleContextSelector extends React.Component<{}, { filteredItems: string[], isOpen: boolean, selected: any, searchValue: string }> {
  items: string[];
  onToggle: (isOpen: boolean) => void;
  onSelect: (event: any, value: any) => void;
  onSearchInputChange: (value: any) => void;
  onSearchButtonClick: (event: any) => void;
  constructor(props) {
    super(props);
    this.items = [
      'SD-WAN Testing',
      'SD-WAN Production',
      'Secure Internet Testing',
      'Secure Internet Production'
    ];

    this.state = {
      isOpen: false,
      selected: this.items[0],
      searchValue: '',
      filteredItems: this.items
    };

    this.onToggle = (isOpen) => {
      this.setState({
        isOpen
      });
    };

    this.onSelect = (event, value) => {
      this.setState({
        selected: value,
        isOpen: !this.state.isOpen
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

  render() {
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
      >
        {filteredItems.map((item, index) => (
          <ContextSelectorItem key={index}>{item}</ContextSelectorItem>
        ))}
      </ContextSelector>
    );
  }
}
