import React from 'react';
import { Dropdown, DropdownToggle, DropdownItem, DropdownSeparator, DropdownPosition } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';


export class IconDropdown extends React.Component<{}, { isOpen: boolean }> {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
    this.onToggle = this.onToggle.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }
  public render() {
    const { isOpen } = this.state;
    const dropdownItems = [
      // List of actions that be possible
      <DropdownItem key="link">Link</DropdownItem>,
      <DropdownItem key="action" component="button">
        Action
      </DropdownItem>,
      <DropdownItem key="disabled link" isDisabled={true}>
        Disabled Link
      </DropdownItem>,
      <DropdownItem key="disabled action" isDisabled={true} component="button">
        Disabled Action
      </DropdownItem>,
      <DropdownSeparator key="separator" />,
      <DropdownItem key="separated link">Separated Link</DropdownItem>,
      <DropdownItem key="separated action" component="button">
        Separated Action
      </DropdownItem>
    ];
    return (
      <Dropdown
        onSelect={this.onSelect}
        toggle={
          <DropdownToggle iconComponent={null} onToggle={this.onToggle} aria-label="Applications">
            <CogIcon />
          </DropdownToggle>
        }
        isOpen={isOpen}
        position={DropdownPosition.right}
        isPlain={true}
        dropdownItems={dropdownItems}
      />
    );
  }
  private onToggle(isOpen: any): void {
    this.setState({
      isOpen
    });
  };
  private onSelect(event: any): void {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };
}