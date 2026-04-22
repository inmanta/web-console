import React, { memo } from "react";
import { Resource } from "@/Core";
import { useUrlStateWithFilter } from "@/Data";
import { FilterField, FilterWidgetComponent } from "@/UI/Components";
import { words } from "@/UI/words";

interface DesiredStateDetailsFilterWidgetProps {
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
 * The DesiredStateDetailsFilterWidget component.
 *
 * A memoized wrapper around FilterWidgetComponent that owns the desired state details
 * filter state via URL state management. By managing the filter state internally,
 * this component avoids re-rendering when the parent page re-renders due to other
 * state changes.
 *
 * @Props {DesiredStateDetailsFilterWidgetProps} - Component props.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const DesiredStateDetailsFilterWidget: React.FC<DesiredStateDetailsFilterWidgetProps> = memo(
  ({ onClose }) => {
    const [filter, setFilter] = useUrlStateWithFilter<Resource.FilterFromVersion>({
      route: "DesiredStateDetails",
    });

    return (
      <FilterWidgetComponent
        onClose={onClose}
        fields={FIELDS}
        filter={filter}
        setFilter={setFilter}
        sectionTitle={words("resources.filters.resource.sectionTitle")}
      />
    );
  }
);
