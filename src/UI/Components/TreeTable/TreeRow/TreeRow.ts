export type TreeRow = Flat | Root | Branch | Leaf;

export interface Cell {
  label: string;
  value: string;
}

interface Flat {
  kind: "Flat";
  id: string;
  cell: Cell;
  cells: Cell[];
}

interface Root {
  kind: "Root";
  id: string;
  onToggle: () => void;
  isChildExpanded: boolean;
  cell: Cell;
}

interface Branch {
  kind: "Branch";
  id: string;
  isExpandedByParent: boolean;
  isChildExpanded: boolean;
  onToggle: () => void;
  level: number;
  cell: Cell;
}

interface Leaf {
  kind: "Leaf";
  id: string;
  isExpandedByParent: boolean;
  cell: Cell;
  cells: Cell[];
  level: number;
}

export function isRowOfMultipleValues(row: Flat | Leaf): boolean {
  const values = row.cells.map(({ value }) => value);
  const nonEmptyValues = values.filter((value) => value.length > 0);
  return nonEmptyValues.length > 1;
}
