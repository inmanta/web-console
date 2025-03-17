import React from "react";
import { FreeTextFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";
import { NotificationFilter } from "@/Data/Managers/V2/Notification/GetNotifications";

interface Props {
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
}

export const TitleFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const update = (values: string[]) => {
    setFilter({
      ...filter,
      title: values.length > 0 ? values : undefined,
    });
  };

  return (
    <FreeTextFilter
      searchEntries={filter.title}
      filterPropertyName={"Title"}
      placeholder={words("notification.title.placeholder")}
      update={update}
    />
  );
};
