import React, { MutableRefObject, useContext, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  KebabToggle,
  NotificationDrawer,
  NotificationDrawerBody,
  NotificationDrawerHeader,
  NotificationDrawerList,
} from "@patternfly/react-core";
import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { Body } from "@S/Notification/Core/Model";
import { drawerQuery } from "@S/Notification/Core/Query";
import { ViewData } from "@S/Notification/Core/Utils";
import { Item, OnUpdate } from "./Item";

interface Props {
  onClose(): void;
  drawerRef: MutableRefObject<HTMLDivElement | undefined>;
}

export const Drawer: React.FC<Props> = ({ onClose, drawerRef }) => {
  const { commandResolver, queryResolver } = useContext(DependencyContext);
  const data = queryResolver.useReadOnly<"GetNotifications">(drawerQuery);

  const trigger = commandResolver.getTrigger<"UpdateNotification">({
    kind: "UpdateNotification",
  });

  return <View {...{ data, onClose, trigger, drawerRef }} />;
};

interface ViewProps extends Props {
  data: ViewData;
  trigger(body: Body, ids: string[]): void;
}

export const View: React.FC<ViewProps> = ({
  data,
  onClose,
  trigger,
  drawerRef,
}) => {
  const count = RemoteData.withFallback(
    RemoteData.mapSuccess(
      (info) => info.data.filter((n) => !n.read).length,
      data
    ),
    undefined
  );

  const getOnUpdate =
    (id: string): OnUpdate =>
    async (body) => {
      trigger(body, [id]);
    };

  return (
    <NotificationDrawer ref={drawerRef}>
      <NotificationDrawerHeader count={count} onClose={onClose}>
        <ActionList />
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
                  <Item
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

const ActionList: React.FC = ({}) => {
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
