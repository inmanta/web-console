import React, { useContext, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  KebabToggle,
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
} from "@patternfly/react-core";
import { words } from "@/UI";
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { MomentDatePresenter } from "@/UI/Utils";
import { Notification, Body } from "@S/Notification/Core/Domain";
import { getSeverityForNotification } from "@S/Notification/UI/Utils";

export type OnUpdate = (body: Body) => void;

interface Props {
  notification: Notification;
  onUpdate: OnUpdate;
}

export const Item: React.FC<Props> = ({ notification, onUpdate }) => {
  return (
    <NotificationDrawerListItem
      variant={getSeverityForNotification(notification.severity)}
      onClick={notification.read ? undefined : () => onUpdate({ read: true })}
      isRead={notification.read}
      aria-label="NotificationItem"
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

const ActionList: React.FC<Props> = ({ notification, onUpdate }) => {
  const { routeManager } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);

  const detailsLink = routeManager.getUrlForApiUri(notification.uri);

  return (
    <Dropdown
      position="right"
      onSelect={() => setIsOpen(false)}
      toggle={
        <KebabToggle
          onToggle={setIsOpen}
          aria-label="NotificationItemActions"
        />
      }
      isOpen={isOpen}
      isPlain
      dropdownItems={[
        <DropdownItem
          key="read"
          component="button"
          onClick={() => onUpdate({ read: false })}
          isDisabled={!notification.read}
        >
          {words("notification.unread")}
        </DropdownItem>,
        <DropdownItem
          key="cleared"
          component="button"
          onClick={() => onUpdate({ cleared: true })}
        >
          {words("notification.drawer.clear")}
        </DropdownItem>,
        <DropdownSeparator key="separator" />,
        <DropdownItem
          key="details"
          isDisabled={detailsLink === undefined}
          component={
            detailsLink ? (
              <Link pathname={detailsLink}>
                {words("notification.drawer.details")}
              </Link>
            ) : undefined
          }
        />,
      ]}
    />
  );
};
