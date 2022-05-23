import React, { useContext, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  KebabToggle,
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
} from "@patternfly/react-core";
import { RouteKindWithId } from "@/Core";
import { useNavigateTo, words } from "@/UI";
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
  const { routeManager } = useContext(DependencyContext);
  const detailsLink: RouteKindWithId<"CompileDetails"> | undefined =
    routeManager.getParamsFromUrl(notification.uri);
  const navigate = useNavigateTo();

  const onClick = (): void => {
    if (!notification.read) onUpdate({ read: true });
    if (detailsLink) {
      navigate(detailsLink.kind, { id: detailsLink.params.id });
    }
  };
  return (
    <NotificationDrawerListItem
      variant={getSeverityForNotification(notification.severity)}
      onClick={onClick}
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
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = (value: boolean, e: React.ChangeEvent): void => {
    e.stopPropagation();
    setIsOpen(value);
  };

  return (
    <Dropdown
      position="right"
      onSelect={() => setIsOpen(false)}
      toggle={
        <KebabToggle onToggle={onToggle} aria-label="NotificationItemActions" />
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
      ]}
    />
  );
};
