import React, { useContext, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  KebabToggle,
  NotificationDrawer,
  NotificationDrawerBody,
  NotificationDrawerHeader,
  NotificationDrawerList,
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
} from "@patternfly/react-core";
import { PageSize, RemoteData } from "@/Core";
import { MomentDatePresenter } from "@/UI";
import { DependencyContext } from "@/UI/Dependency";
import { Model, SeverityLevel } from "@S/Notification/Core/Model";
import { ViewData } from "@S/Notification/Core/Utils";

interface Props {
  onClose(): void;
}

export const Drawer: React.FC<Props> = ({ onClose }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useContinuous<"GetNotifications">({
    kind: "GetNotifications",
    origin: "drawer",
    pageSize: PageSize.from("100"),
  });

  return <View {...{ data, onClose }} />;
};

interface ViewProps extends Props {
  data: ViewData;
}

export const View: React.FC<ViewProps> = ({ data, onClose }) => {
  const count = RemoteData.withFallback(
    RemoteData.mapSuccess(
      (info) => info.data.filter((n) => !n.read).length,
      data
    ),
    undefined
  );

  const getOnUpdate =
    (id: string): OnUpdate =>
    async (key, value) => {
      alert(`${id} ${key} ${value}`);
    };

  return (
    <NotificationDrawer>
      <NotificationDrawerHeader count={count} onClose={onClose}>
        <HeaderKebap />
      </NotificationDrawerHeader>
      <NotificationDrawerBody>
        <NotificationDrawerList>
          {RemoteData.fold(
            {
              notAsked: () => null,
              loading: () => null,
              failed: () => null,
              success: ({ data }) =>
                data.map((notification) => (
                  <ListItem
                    {...{ notification }}
                    key={notification.id}
                    onUpdate={getOnUpdate(notification.id)}
                  />
                )),
            },
            data
          )}
        </NotificationDrawerList>
      </NotificationDrawerBody>
    </NotificationDrawer>
  );
};

const HeaderKebap: React.FC = ({}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dropdown
      onSelect={() => setIsOpen(false)}
      toggle={<KebabToggle onToggle={setIsOpen} />}
      isOpen={isOpen}
      isPlain
      dropdownItems={[
        <DropdownItem key="link">Link</DropdownItem>,
        <DropdownItem key="action" component="button">
          Action
        </DropdownItem>,
        <DropdownSeparator key="separator" />,
        <DropdownItem key="disabled link" isDisabled>
          Disabled link
        </DropdownItem>,
      ]}
      id="notification-0"
      position="right"
    />
  );
};

type VisualSeverity = "default" | "success" | "danger" | "warning" | "info";

type OnUpdate = (key: "cleared" | "read", value: boolean) => void;

interface ItemProps {
  notification: Model;
  onUpdate: OnUpdate;
}

const ListItem: React.FC<ItemProps> = ({ notification, onUpdate }) => {
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
        <ItemKebap {...{ notification, onUpdate }} />
      </NotificationDrawerListItemHeader>
      <NotificationDrawerListItemBody
        timestamp={new MomentDatePresenter().get(notification.created).relative}
      >
        {notification.message}
      </NotificationDrawerListItemBody>
    </NotificationDrawerListItem>
  );
};

const getSeverityForNotification = (
  severity: SeverityLevel
): VisualSeverity => {
  switch (severity) {
    case "error":
      return "danger";
    case "message":
      return "default";
    default:
      return severity;
  }
};

const ItemKebap: React.FC<ItemProps> = ({ notification, onUpdate }) => {
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
