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
} from "@patternfly/react-core";
import { PageSize, RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { ViewData } from "@S/Notification/Core/Utils";
import { Item, OnUpdate } from "./Item";

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
