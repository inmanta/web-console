export type TreeRow = Flat | Root | Branch | Leaf;

export interface Cell {
  label: string;
  value: string;
  hasRelation?: boolean;
}

interface Flat {
  kind: "Flat";
  id: string;

  /** 1-based position among the rows that share its parent, set as aria-posinset for screen readers. */
  positionInSet: number;
  primaryCell: Cell;
  valueCells: Cell[];
}

interface Root {
  kind: "Root";
  id: string;

  /** 1-based position among the rows that share its parent, set as aria-posinset for screen readers. */
  positionInSet: number;

  /** Number of direct child rows, set as aria-setsize; PatternFly only draws the expand toggle when it is above 0. */
  childCount: number;
  onToggle: () => void;
  isChildExpanded: boolean;
  primaryCell: Cell;
}

interface Branch {
  kind: "Branch";
  id: string;

  /** 1-based position among the rows that share its parent, set as aria-posinset for screen readers. */
  positionInSet: number;

  /** Number of direct child rows, set as aria-setsize; PatternFly only draws the expand toggle when it is above 0. */
  childCount: number;
  isExpandedByParent: boolean;
  isChildExpanded: boolean;
  onToggle: () => void;
  level: number;
  primaryCell: Cell;
}

interface Leaf {
  kind: "Leaf";
  id: string;

  /** 1-based position among the rows that share its parent, set as aria-posinset for screen readers. */
  positionInSet: number;
  isExpandedByParent: boolean;
  level: number;
  primaryCell: Cell;
  valueCells: Cell[];
}
