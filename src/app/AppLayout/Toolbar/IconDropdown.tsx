import React, { FunctionComponent } from 'react';
import { Dropdown, DropdownToggle, DropdownPosition, IconProps } from '@patternfly/react-core';


export class IconDropdown extends React.Component<{icon: FunctionComponent<IconProps>, dropdownItems: JSX.Element[]}, { isOpen: boolean }> {

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
    return (
      <Dropdown
        onSelect={this.onSelect}
        toggle={
          <DropdownToggle iconComponent={this.props.icon} onToggle={this.onToggle} aria-label="Applications" />
        }
        isOpen={isOpen}
        position={DropdownPosition.right}
        isPlain={true}
        dropdownItems={this.props.dropdownItems}
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