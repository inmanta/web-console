import React from "react";
import { Resource } from "@/Core";
import { FreeTextFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";

interface Props {
  filter: Resource.Filter;
  setFilter: (filter: Resource.Filter) => void;
}
export const ValueFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const updateValue = (values: string[]) =>
    setFilter({ ...filter, value: values.length > 0 ? values : undefined });

  return (
    <FreeTextFilter
      searchEntries={filter.value}
      filterPropertyName={Resource.FilterKind.Value}
      placeholder={words("resources.filters.value.placeholder")}
      update={updateValue}
    />
  );
};
