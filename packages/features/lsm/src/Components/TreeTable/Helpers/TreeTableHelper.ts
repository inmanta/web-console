import { Attributes } from "@inmanta/web-console-core";
import { TreeRow } from "@inmanta/web-console-feature-lsm/Components/TreeTable/TreeRow";
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
