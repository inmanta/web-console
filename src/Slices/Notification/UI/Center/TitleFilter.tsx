import React from "react";
import { FreeTextFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";
import { Filter } from "@S/Notification/Core/Query";

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
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
