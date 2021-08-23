import React from "react";
import { ResourceParams } from "@/Core";
import { FreeTextFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";

interface Props {
  filter: ResourceParams.Filter;
  setFilter: (filter: ResourceParams.Filter) => void;
}
export const ValueFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const updateValue = (values: string[]) =>
    setFilter({ ...filter, value: values.length > 0 ? values : undefined });

  return (
    <FreeTextFilter
      isVisible={true}
      searchEntries={filter.value}
      filterPropertyName={ResourceParams.Kind.Value}
      placeholder={words("resources.filters.value.placeholder")}
      update={updateValue}
    />
  );
};
