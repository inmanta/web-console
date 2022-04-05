import { TreeRow } from "@/UI/Components/TreeTable/TreeRow";
import { ExpansionState } from "./TreeExpansionManager";

export interface TreeTableHelper {
  getColumns(): string[];

  getExpansionState(): ExpansionState;

  createRows(
    expansionState: ExpansionState,
    setState: (state: ExpansionState) => void
  ): TreeRow[];

  getEmptyAttributeSets(): string[];
}
