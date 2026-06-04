import React, { memo, useMemo } from "react";
import { useUrlStateWithFilter } from "@/Data";
import { Filter } from "@/Slices/DesiredState/Core/Types";
import { applyFilterDefaults } from "@S/DesiredState/UI/Utils";
import { FilterWidgetComponent } from "./FilterWidgetComponent";

interface Props {
  onClose: () => void;
}

/**
 * Memoized wrapper around FilterWidgetComponent that owns its filter state
 * via URL state management. By managing the filter state internally, this component
 * avoids re-rendering when the parent page re-renders due to other state changes.
 * Only the table area needs to respond to filter changes; the filter widget itself
 * preserves its UI state (open dropdowns, active picker) across filter updates.
 *
 * The disregardDefault flag is stored in the URL to survive round-trips and
 * signals that the user has explicitly cleared the default status filters.
 */
export const ConnectedFilterWidget: React.FC<Props> = memo(({ onClose }) => {
  const [filter, setFilter] = useUrlStateWithFilter<Filter>({
    route: "DesiredState",
    keys: { date: "DateRange", version: "IntRange", disregardDefault: "Boolean" },
  });

  const filterWithDefaults = useMemo(() => applyFilterDefaults(filter), [filter]);

  return (
    <FilterWidgetComponent filter={filterWithDefaults} setFilter={setFilter} onClose={onClose} />
  );
});

ConnectedFilterWidget.displayName = "ConnectedFilterWidget";
