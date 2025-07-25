import React, { useContext, useState } from "react";
import {
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
  Dropdown,
  DropdownItem,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { RouteKindWithId } from "@/Core";
import { words } from "@/UI";
import { DependencyContext } from "@/UI/Dependency";
import { useNavigateTo } from "@/UI/Routing";
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
  const detailsLink: RouteKindWithId<"CompileDetails"> | undefined = routeManager.getParamsFromUrl(
    notification.uri || ""
  );
  const navigate = useNavigateTo();

  const onClick = (): void => {
    if (!notification.read) {
      onUpdate({ read: true });
    }

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

  const onToggle = (event: React.MouseEvent<Element>): void => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <Dropdown
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          aria-label="NotificationListItemActions"
          variant="plain"
          isExpanded={isOpen}
          onClick={onToggle}
          icon={<EllipsisVIcon />}
        />
      )}
      onSelect={() => setIsOpen(false)}
      popperProps={{ position: "right" }}
      isOpen={isOpen}
    >
      <DropdownList>
        <DropdownItem
          key="read"
          component="button"
          onClick={(event) => {
            event.stopPropagation();
            onUpdate({ read: false });
          }}
          isDisabled={!notification.read}
        >
          {words("notification.unread")}
        </DropdownItem>
        <DropdownItem
          key="cleared"
          component="button"
          onClick={(event) => {
            event.stopPropagation();
            onUpdate({ read: true, cleared: true });
          }}
        >
          {words("notification.drawer.clear")}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};
