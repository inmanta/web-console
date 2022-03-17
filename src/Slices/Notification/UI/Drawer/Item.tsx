import React, { useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  KebabToggle,
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
} from "@patternfly/react-core";
import { MomentDatePresenter } from "@/UI";
import { Model, Severity } from "@S/Notification/Core/Model";

interface Props {
  notification: Model;
  onUpdate: OnUpdate;
}

export const Item: React.FC<Props> = ({ notification, onUpdate }) => {
  return (
    <NotificationDrawerListItem
      variant={getSeverityForNotification(notification.severity)}
      onClick={notification.read ? undefined : () => onUpdate("read", true)}
      isRead={notification.read}
    >
      <NotificationDrawerListItemHeader
        variant={getSeverityForNotification(notification.severity)}
        title={notification.title}
      >
        <ActionList {...{ notification, onUpdate }} />
      </NotificationDrawerListItemHeader>
      <NotificationDrawerListItemBody
        timestamp={new MomentDatePresenter().get(notification.created).relative}
      >
        {notification.message}
      </NotificationDrawerListItemBody>
    </NotificationDrawerListItem>
  );
};

const getSeverityForNotification = (severity: Severity): VisualSeverity => {
  switch (severity) {
    case "error":
      return "danger";
    case "message":
      return "default";
    default:
      return severity;
  }
};

const ActionList: React.FC<Props> = ({ notification, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      position="right"
      onSelect={() => setIsOpen(false)}
      toggle={<KebabToggle onToggle={setIsOpen} />}
      isOpen={isOpen}
      isPlain
      dropdownItems={[
        <DropdownItem
          key="read"
          component="button"
          onClick={() => onUpdate("read", false)}
          isDisabled={!notification.read}
        >
          Mark as Unread
        </DropdownItem>,
        <DropdownItem
          key="cleared"
          component="button"
          onClick={() => onUpdate("cleared", true)}
        >
          Clear
        </DropdownItem>,
        <DropdownSeparator key="separator" />,
        <DropdownItem key="disabled link" isDisabled>
          Details
        </DropdownItem>,
      ]}
    />
  );
};

type VisualSeverity = "default" | "success" | "danger" | "warning" | "info";

export type OnUpdate = (key: "cleared" | "read", value: boolean) => void;
