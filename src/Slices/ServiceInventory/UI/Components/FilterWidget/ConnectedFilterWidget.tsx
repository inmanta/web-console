import React, { memo } from "react";
import { ServiceInstanceParams } from "@/Core";
import { useUrlStateWithFilter } from "@/Data";
import { FilterWidgetComponent } from "./FilterWidgetComponent";

interface Props {
  states: string[];
  onClose: () => void;
}

/**
 * Memoized wrapper around FilterWidgetComponent that owns its filter state
 * via URL state management. By managing the filter state internally, this component
 * avoids re-rendering when the parent page re-renders due to other state changes.
 * Only the table area needs to respond to filter changes; the filter widget itself
 * preserves its UI state (open dropdowns, typed input) across filter updates.
 *
 * @Props {Props} - Component props.
 *  @prop {string[]} states - The lifecycle state names offered by the state filter.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const ConnectedFilterWidget: React.FC<Props> = memo(({ states, onClose }) => {
  const [filter, setFilter] = useUrlStateWithFilter<ServiceInstanceParams.Filter>({
    route: "Inventory",
  });

  return (
    <FilterWidgetComponent
      filter={filter}
      setFilter={setFilter}
      states={states}
      onClose={onClose}
    />
  );
});

ConnectedFilterWidget.displayName = "ConnectedFilterWidget";
