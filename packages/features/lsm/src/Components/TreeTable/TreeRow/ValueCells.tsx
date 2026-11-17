import React from "react";
import { CellWithCopy } from "./CellWithCopy";
import { Cell } from "./TreeRow";

/**
 * The props of the ValueCells component.
 */
interface Props {
  cells: Cell[];
}

/**
 * ValueCells renders the value cells of a Flat or Leaf row.
 * A cut-off value shows in full, with a copy button, in a popover.
 *
 * @prop {Cell[]} cells - The value cells of the row.
 */
export const ValueCells: React.FC<Props> = ({ cells }) =>
  cells.map(({ label, value, hasRelation }) => (
    <CellWithCopy
      label={label}
      value={label === "description" && value === "null" ? "" : value}
      hasRelation={hasRelation}
      className={"pf-v6-c-truncate"}
      key={`${label}-${value}`}
    />
  ));
