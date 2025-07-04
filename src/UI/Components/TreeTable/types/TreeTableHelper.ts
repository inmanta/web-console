import { Attributes } from "@/Core";
import { ExpansionState } from "../Helpers/TreeExpansionManager";
import { TreeRow } from "../TreeRow/TreeRow";

export interface TreeTableHelper {
  getColumns(): string[];
  getExpansionState(): ExpansionState;
  createRows(
    expansionState: ExpansionState,
    setState: (state: ExpansionState) => void
  ): { rows: TreeRow[]; openAll: () => void; closeAll: () => void };
  getEmptyAttributeSets(): string[];
  getAttributes(): Attributes;
}
