import React, { memo } from "react";
import { Resource } from "@/Core";
import { useUrlStateWithFilter } from "@/Data";
import { FilterWidgetComponent } from "./FilterWidgetComponent";

interface ConnectedFilterWidgetProps {
  onClose: () => void;
}

/**
 * The ConnectedFilterWidget component.
 *
 * A memoized wrapper around FilterWidgetComponent that owns its filter state
 * via URL state management.
 *
 * @Props {ConnectedFilterWidgetProps} - Component props.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const ConnectedFilterWidget: React.FC<ConnectedFilterWidgetProps> = memo(({ onClose }) => {
  const [filter, setFilter] = useUrlStateWithFilter<Resource.FilterFromVersion>({
    route: "DesiredStateDetails",
  });

  return <FilterWidgetComponent onClose={onClose} filter={filter} setFilter={setFilter} />;
});

ConnectedFilterWidget.displayName = "ConnectedFilterWidget";
