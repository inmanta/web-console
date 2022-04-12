import React, { useContext, useState } from "react";
import { Dropdown, DropdownItem, KebabToggle } from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  read: boolean;
  id: string;
  onUpdate(): void;
}

export const ActionList: React.FC<Props> = ({ read, id, onUpdate }) => {
  const { commandResolver } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const trigger = commandResolver.getTrigger<"UpdateNotification">({
    kind: "UpdateNotification",
    origin: "center",
  });

  const onRead = () => trigger({ read: true }, [id], onUpdate);
  const onUnread = () => trigger({ read: false }, [id], onUpdate);

  return (
    <Dropdown
      isPlain
      position="right"
      isOpen={isOpen}
      onSelect={() => setIsOpen(false)}
      toggle={<KebabToggle onToggle={setIsOpen} />}
      dropdownItems={[
        <DropdownItem
          key="read"
          component="button"
          isDisabled={read}
          onClick={onRead}
        >
          {words("notification.read")}
        </DropdownItem>,
        <DropdownItem
          key="unread"
          component="button"
          isDisabled={!read}
          onClick={onUnread}
        >
          {words("notification.unread")}
        </DropdownItem>,
      ]}
    />
  );
};
