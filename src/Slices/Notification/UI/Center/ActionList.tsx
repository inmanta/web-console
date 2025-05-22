import React, { useState } from "react";
import { Dropdown, DropdownItem, MenuToggle, MenuToggleElement } from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { useUpdateNotification } from "@/Data/Queries/Slices/Notification/UpdateNotification";
import { words } from "@/UI/words";

/**
 * Props for the ActionList component.
 *
 * @property {boolean} read - Whether the notification is read
 * @property {string} id - The unique identifier of the notification
 * @property {() => void} onUpdate - Callback function triggered after a successful update
 */
interface Props {
  read: boolean;
  id: string;
  onUpdate(): void;
}

/**
 * Component that renders a dropdown menu with actions for a notification.
 * Provides options to mark notifications as read/unread.
 */
export const ActionList: React.FC<Props> = ({ read, id, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate } = useUpdateNotification({
    onSuccess: () => {
      onUpdate();
    },
  });

  const onRead = () => mutate({ body: { read: true }, ids: [id] });
  const onUnread = () => mutate({ body: { read: false }, ids: [id] });

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={() => setIsOpen(false)}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      popperProps={{ position: "center" }}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          aria-label="notifications-dropdown"
          variant="plain"
          onClick={onToggleClick}
          isExpanded={isOpen}
          icon={<EllipsisVIcon />}
        />
      )}
    >
      <DropdownItem key="read" component="button" isDisabled={read} onClick={onRead}>
        {words("notification.read")}
      </DropdownItem>
      <DropdownItem key="unread" component="button" isDisabled={!read} onClick={onUnread}>
        {words("notification.unread")}
      </DropdownItem>
    </Dropdown>
  );
};
