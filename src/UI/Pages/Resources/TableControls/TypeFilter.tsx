import React from "react";
import { ResourceParams } from "@/Core";
import { FreeTextFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";

interface Props {
  filter: ResourceParams.Filter;
  setFilter: (filter: ResourceParams.Filter) => void;
}
export const TypeFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const updateType = (types: string[]) =>
    setFilter({ ...filter, type: types.length > 0 ? types : undefined });

  return (
    <FreeTextFilter
      isVisible={true}
      searchEntries={filter.type}
      filterPropertyName={ResourceParams.Kind.Type}
      placeholder={words("resources.filters.type.placeholder")}
      update={updateType}
    />
  );
};
