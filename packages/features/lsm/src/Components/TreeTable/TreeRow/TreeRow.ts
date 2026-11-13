export type TreeRow = Flat | Root | Branch | Leaf;

export interface Cell {
  label: string;
  value: string;
  hasRelation?: boolean;
}

interface Flat {
  kind: "Flat";
  id: string;
  primaryCell: Cell;
  valueCells: Cell[];
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
}
