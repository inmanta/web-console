import React from 'react';
import { NotificationBadge, Dropdown, DropdownToggle, DropdownItem, DropdownSeparator, DropdownPosition, DropdownDirection, KebabToggle } from '@patternfly/react-core';
import { BellIcon } from '@patternfly/react-icons';
import { CogIcon } from '@patternfly/react-icons';

class SimpleNotificationBadge extends React.Component<{}, { isRead: boolean }> {
  onClick: () => void;
  constructor(props) {
    super(props);
    this.state = {
      isRead: false
    };
    this.onClick = () => {
      this.setState({
        isRead: true
      });
    };
  }

  render() {
    const { isRead } = this.state;
    return (
      <NotificationBadge isRead={isRead} onClick={this.onClick} aria-label="Notifications">
        <BellIcon />
      </NotificationBadge>
    );
  }
}



class IconDropdown extends React.Component<{},{isOpen: boolean}> {
  onToggle: (isOpen: any) => void;
  onSelect: (event: any) => void;
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
    this.onToggle = isOpen => {
      this.setState({
        isOpen
      });
    };
    this.onSelect = event => {
      this.setState({
        isOpen: !this.state.isOpen
      });
    };
  }

  render() {
    const { isOpen } = this.state;
    const dropdownItems = [
      // List of actions that be possible
      <DropdownItem key="link">Link</DropdownItem>,
      <DropdownItem key="action" component="button">
        Action
      </DropdownItem>,
      <DropdownItem key="disabled link" isDisabled>
        Disabled Link
      </DropdownItem>,
      <DropdownItem key="disabled action" isDisabled component="button">
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
        isPlain
        dropdownItems={dropdownItems}
      />
    );
  }
}


export { SimpleNotificationBadge, IconDropdown };