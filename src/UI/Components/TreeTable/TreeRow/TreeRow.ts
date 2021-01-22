export type TreeRow = Flat | Root | Branch | Leaf;

interface Cell {
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
