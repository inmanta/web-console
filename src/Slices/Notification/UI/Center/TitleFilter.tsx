import React from "react";
import { NotificationFilter } from "@/Data/Queries";
import { FreeTextFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";

/**
 * Props for the TitleFilter component.
 *
 * @property {NotificationFilter} filter - Current filter state for notifications
 * @property {(filter: NotificationFilter) => void} setFilter - Function to update the filter state
 */
interface Props {
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
}

/**
 * Component that provides a free text filter for notification titles.
 * Allows users to filter notifications based on their titles.
 */
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
