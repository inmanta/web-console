import { Attributes } from "@/Core";
import { TreeRow } from "@/UI/Components/TreeTable/TreeRow";
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