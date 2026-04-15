import React, { memo } from "react";
import { useUrlStateWithFilter } from "@/Data";
import { Filter } from "@/Data/Queries";
import { FilterWidgetComponent } from "./FilterWidgetComponent";

interface ConnectedFilterWidgetProps {
  onClose: () => void;
}

/**
 * The ConnectedFilterWidget component.
 *
 * A memoized wrapper around FilterWidgetComponent that owns its filter state
 * via URL state management. By managing the filter state internally, this component
 * avoids re-rendering when the parent page re-renders due to other state changes.
 *
 * @Props {ConnectedFilterWidgetProps} - Component props.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const ConnectedFilterWidget: React.FC<ConnectedFilterWidgetProps> = memo(({ onClose }) => {
  const [filter, setFilter] = useUrlStateWithFilter<Filter>({
    route: "DiscoveredResources",
  });

  return <FilterWidgetComponent onClose={onClose} filter={filter} setFilter={setFilter} />;
});

ConnectedFilterWidget.displayName = "ConnectedFilterWidget";
