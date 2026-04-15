import React, { memo } from "react";
import { Resource } from "@/Core";
import { useUrlStateWithFilter } from "@/Data";
import { FilterWidgetComponent } from "@/UI/Components";

interface DesiredStateDetailsFilterWidgetProps {
  onClose: () => void;
}

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
export const DesiredStateDetailsFilterWidget: React.FC<DesiredStateDetailsFilterWidgetProps> = memo(({ onClose }) => {
  const [filter, setFilter] = useUrlStateWithFilter<Resource.FilterFromVersion>({
    route: "DesiredStateDetails",
  });

  return <FilterWidgetComponent onClose={onClose} filter={filter} setFilter={setFilter} />;
});
