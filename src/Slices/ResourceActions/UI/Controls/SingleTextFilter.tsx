import React from "react";
import { FreeTextFilter } from "@/UI/Components/Filters";

interface Props {
  filterPropertyName: string;
  placeholder: string;
  value?: string;
  update: (value: string | undefined) => void;
}

/**
 * A single-value free-text filter, wrapping the shared multi-value
 * FreeTextFilter. The `get_resource_actions` API only accepts one value per
 * field, so only the most recent entry is kept.
 *
 * @props {Props} props - The props of the component.
 * @returns {React.FC<Props>} The filter component.
 */
export const SingleTextFilter: React.FC<Props> = ({
  filterPropertyName,
  placeholder,
  value,
  update,
}) => (
  <FreeTextFilter
    filterPropertyName={filterPropertyName}
    placeholder={placeholder}
    searchEntries={value ? [value] : []}
    update={(entries) => update(entries.length > 0 ? entries[entries.length - 1] : undefined)}
  />
);
