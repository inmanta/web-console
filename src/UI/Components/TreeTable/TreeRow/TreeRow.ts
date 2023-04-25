export type TreeRow = Flat | Root | Branch | Leaf;

export interface Cell {
  label: string;
  value: string;
  hasRelation?: boolean;
  serviceName?: string;
  warning?: string;
}

interface Flat {
  kind: "Flat";
  id: string;
  primaryCell: Cell;
  valueCells: Cell[];
  type?: string;
}

interface Root {
  kind: "Root";
  id: string;
  onToggle: () => void;
  isChildExpanded: boolean;
  primaryCell: Cell;
}

interface Branch {
  kind: "Branch";
  id: string;
  isExpandedByParent: boolean;
  isChildExpanded: boolean;
  onToggle: () => void;
  level: number;
  primaryCell: Cell;
}

interface Leaf {
  kind: "Leaf";
  id: string;
  isExpandedByParent: boolean;
  level: number;
  primaryCell: Cell;
  valueCells: Cell[];
  type?: string;
}

export function isRowOfMultipleValues(row: Flat | Leaf): boolean {
  const values = row.valueCells.map(({ value }) => value);
  const nonEmptyValues = values.filter((value) => value.length > 0);
  return nonEmptyValues.length > 1;
}
