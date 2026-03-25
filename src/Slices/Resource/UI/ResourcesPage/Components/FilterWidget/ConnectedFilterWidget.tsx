import React, { memo, useMemo } from "react";
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
 * via URL state management. By managing the filter state internally, this component
 * avoids re-rendering when the parent page re-renders due to other state changes.
 * Only the table area needs to respond to filter changes; the filter widget itself
 * preserves its UI state (open dropdowns, active tab) across filter updates.
 *
 * @Props {ConnectedFilterWidgetProps} - Component props.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const ConnectedFilterWidget: React.FC<ConnectedFilterWidgetProps> = memo(({ onClose }) => {
  const [filter, setFilter] = useUrlStateWithFilter<Resource.FilterWithDefaultHandling>({
    route: "Resources",
    keys: { disregardDefault: "Boolean" },
  });

  const filterWithDefaults = useMemo(() => {
    return !filter.disregardDefault && !filter.status
      ? { ...filter, status: ["!orphaned"] }
      : filter;
  }, [filter]);

  return (
    <FilterWidgetComponent onClose={onClose} filter={filterWithDefaults} setFilter={setFilter} />
  );
});

ConnectedFilterWidget.displayName = "ConnectedFilterWidget";
