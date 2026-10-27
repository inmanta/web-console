import { TreeRow } from "@/UI/Components/TreeTable/TreeRow";
import { Attributes } from "@inmanta/web-console-core";
import { ExpansionState } from "./TreeExpansionManager";

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
