import React from "react";
import { words } from "@inmanta/web-console-core";
import { NotificationFilter } from "@inmanta/web-console-core/Queries/Slices/Notification";
import { FreeTextFilter } from "@inmanta/web-console-ui/Components/Filters";

interface Props {
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
}

export const MessageFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const update = (messageValues: string[]) => {
    setFilter({
      ...filter,
      message: messageValues.length > 0 ? messageValues : undefined,
    });
  };

  return (
    <FreeTextFilter
      searchEntries={filter.message}
      filterPropertyName={"Message"}
      placeholder={words("notification.message.placeholder")}
      update={update}
    />
  );
};
