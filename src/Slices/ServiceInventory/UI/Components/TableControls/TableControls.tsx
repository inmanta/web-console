import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { ServiceModel, ServiceInstanceParams } from "@/Core";
import { FilterWidget } from "@S/ServiceInventory/UI/Components/FilterWidget";

interface Props {
  instanceSummary: React.ReactNode;
  filter: ServiceInstanceParams.Filter;
  setFilter: (filter: ServiceInstanceParams.Filter) => void;
  service: ServiceModel;
  paginationWidget: React.ReactNode;
}

/**
 * The TableControls component for the Service Inventory page.
 *
 * Renders the toolbar with the instance counts and the filter widget on the left, and the
 * pagination widget on the right.
 *
 * @Props {Props} - Component props.
 *  @prop {React.ReactNode} instanceSummary - The instance counts of the service.
 *  @prop {ServiceInstanceParams.Filter} filter - The active filter.
 *  @prop {(filter: ServiceInstanceParams.Filter) => void} setFilter - Updates the filter.
 *  @prop {ServiceModel} service - The service, used for its lifecycle states.
 *  @prop {React.ReactNode} paginationWidget - The pagination widget.
 *
 * @returns {React.ReactElement} The rendered table controls.
 */
export const TableControls: React.FC<Props> = ({
  instanceSummary,
  filter,
  setFilter,
  service,
  paginationWidget,
}) => {
  const states = service.lifecycle.states.map((state) => state.name).sort();

  return (
    <Toolbar clearAllFilters={() => setFilter({})}>
      <ToolbarContent alignItems="center">
        {instanceSummary && <ToolbarItem>{instanceSummary}</ToolbarItem>}
        <FilterWidget filter={filter} setFilter={setFilter} states={states} />
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
