import React, { memo } from "react";
import { useUrlStateWithFilter } from "@/Data";
import { Filter } from "@/Data/Queries";
import { FilterField, FilterWidgetComponent, GenericFilter } from "@/UI/Components";
import { words } from "@/UI/words";

interface DiscoveredResourcesFilterWidgetProps {
  onClose: () => void;
}

const FIELDS: FilterField[] = [
  {
    label: words("resources.filters.resource.type.label"),
    placeholder: words("resources.filters.resource.type.placeholder"),
    filterKey: "type",
  },
  {
    label: words("resources.filters.resource.agent.label"),
    placeholder: words("resources.filters.resource.agent.placeholder"),
    filterKey: "agent",
  },
  {
    label: words("resources.filters.resource.value.label"),
    placeholder: words("resources.filters.resource.value.placeholder"),
    filterKey: "value",
  },
];

/**
 * The DiscoveredResourcesFilterWidget component.
 *
 * A memoized wrapper around FilterWidgetComponent that owns the discovered resources
 * filter state via URL state management. By managing the filter state internally,
 * this component avoids re-rendering when the parent page re-renders due to other
 * state changes.
 *
 * @Props {DiscoveredResourcesFilterWidgetProps} - Component props.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const DiscoveredResourcesFilterWidget: React.FC<DiscoveredResourcesFilterWidgetProps> = memo(
  ({ onClose }) => {
    const [filter, setFilter] = useUrlStateWithFilter<Filter>({
      route: "DiscoveredResources",
    });

    return (
      <FilterWidgetComponent
        onClose={onClose}
        fields={FIELDS}
        filter={filter as GenericFilter}
        setFilter={(updated) => setFilter(updated as Filter)}
        sectionTitle={words("resources.filters.resource.sectionTitle")}
      />
    );
  }
);
