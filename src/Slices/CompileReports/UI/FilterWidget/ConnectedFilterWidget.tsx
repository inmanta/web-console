import React, { memo } from "react";
import { useUrlStateWithFilter } from "@/Data";
import { Filter } from "@/Slices/CompileReports/Core/Types";
import { FilterWidgetComponent } from "./FilterWidgetComponent";

interface Props {
  onClose: () => void;
}

/**
 * Memoized wrapper around FilterWidgetComponent that owns its filter state
 * via URL state management. By managing the filter state internally, this component
 * avoids re-rendering when the parent page re-renders due to other state changes
 * (e.g. the continuous polling of the compile reports query). Only the table area needs
 * to respond to filter changes; the filter widget itself preserves its UI state
 * (open dropdowns, typed input) across filter updates.
 *
 * @Props {Props} - Component props.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const ConnectedFilterWidget: React.FC<Props> = memo(({ onClose }) => {
  const [filter, setFilter] = useUrlStateWithFilter<Filter>({
    route: "CompileReports",
    keys: { requested: "DateRange", success: "Boolean" },
  });

  return <FilterWidgetComponent filter={filter} setFilter={setFilter} onClose={onClose} />;
});

ConnectedFilterWidget.displayName = "ConnectedFilterWidget";
