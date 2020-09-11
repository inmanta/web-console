import React from 'react';
import { NotificationBadge } from '@patternfly/react-core';
import { BellIcon } from '@patternfly/react-icons';

export class SimpleNotificationBadge extends React.Component<{}, { isRead: boolean }> {
  constructor(props) {
    super(props);
    this.state = {
      isRead: true
    };
    this.onClick = this.onClick.bind(this);
  }
  public render() {
    const { isRead } = this.state;
    return (
      <NotificationBadge isRead={isRead} onClick={this.onClick} aria-label="Notifications">
        <BellIcon />
      </NotificationBadge>
    );
  }
  private onClick(): void {
    this.setState({
      isRead: true
    });
  };
}