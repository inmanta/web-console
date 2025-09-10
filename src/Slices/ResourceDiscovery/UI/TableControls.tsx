import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";

interface Props {
  paginationWidget: React.ReactNode;
}

/**
 * The TableControls component.
 *
 * This component is responsible of displaying the table controls.
 *
 * @Props {Props} - The props of the component
 *  @prop {React.ReactNode} paginationWidget - The pagination widget
 *
 * @returns {React.FC} TableControls component
 */
export const TableControls: React.FC<Props> = ({ paginationWidget }) => {
  return (
    <Toolbar>
      <ToolbarContent>
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
