import React, { MutableRefObject, useContext, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  KebabToggle,
  NotificationDrawer,
  NotificationDrawerBody,
  NotificationDrawerHeader,
  NotificationDrawerList,
} from "@patternfly/react-core";
import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { useNavigateTo } from "@/UI/Routing";
import { words } from "@/UI/words";
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
    (ids: string[]): OnUpdate =>
    async (body) => {
      trigger(body, ids);
    };

  const onUpdateForAll = !RemoteData.isSuccess(data)
    ? () => undefined
    : getOnUpdate(data.value.data.map((notification) => notification.id));

  return (
    <NotificationDrawer ref={drawerRef}>
      <NotificationDrawerHeader count={count} onClose={onClose}>
        <ActionList {...{ onUpdateForAll, onClose }} />
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
                    onUpdate={getOnUpdate([notification.id])}
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

interface ActionListProps {
  onUpdateForAll: OnUpdate;
  onClose(): void;
}

const ActionList: React.FC<ActionListProps> = ({ onUpdateForAll, onClose }) => {
  const navigateTo = useNavigateTo();
  const [isOpen, setIsOpen] = useState(false);

  const onShowAll = () => {
    navigateTo("NotificationCenter", undefined);
    onClose();
  };
  return (
    <Dropdown
      onSelect={() => setIsOpen(false)}
      toggle={<KebabToggle onToggle={setIsOpen} />}
      isOpen={isOpen}
      isPlain
      dropdownItems={[
        <DropdownItem
          key="readAll"
          component="button"
          onClick={() => onUpdateForAll({ read: true })}
        >
          {words("notification.drawer.readAll")}
        </DropdownItem>,
        <DropdownItem
          key="clearAll"
          component="button"
          onClick={() => onUpdateForAll({ cleared: true })}
        >
          {words("notification.drawer.clearAll")}
        </DropdownItem>,
        <DropdownItem key="seeAll" component="button" onClick={onShowAll}>
          {words("notification.drawer.showAll")}
        </DropdownItem>,
      ]}
      id="notification-0"
      position="right"
    />
  );
};
