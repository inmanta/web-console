import {
  Cell,
  TreeRow,
  TreeRowCreator,
} from "@/UI/Components/TreeTable/TreeRow";
import { AttributeTree } from "@/UI/Components/TreeTable/types";
import { AttributeHelper } from "./AttributeHelper";
import { MultiAttributeNode } from "./AttributeNode";
import { PathHelper } from "./PathHelper";
import { ExpansionState, TreeExpansionManager } from "./TreeExpansionManager";

export interface TreeTableHelper {
  getColumns(): string[];

  getExpansionState(): ExpansionState;

  createRows(
    expansionState: ExpansionState,
    setState: (state: ExpansionState) => void
  ): { rows: TreeRow[]; openAll: () => void; closeAll: () => void };

  getEmptyAttributeSets(): string[];
}

export abstract class BaseTreeTableHelper<A extends AttributeTree>
  implements TreeTableHelper
{
  constructor(
    private readonly pathHelper: PathHelper,
    private readonly expansionManager: TreeExpansionManager,
    private readonly attributeHelper: AttributeHelper<A>,
    protected readonly attributes: A["source"],
    private readonly extractValues: (
      node: Extract<MultiAttributeNode<A["target"]>, { kind: "Leaf" }>
    ) => Cell[]
  ) {}
  abstract getColumns(): string[];

  getExpansionState(): ExpansionState {
    return this.expansionManager.create(
      this.attributeHelper.getPaths(this.attributes)
    );
  }
  createRows(
    expansionState: ExpansionState,
    setState: (state: ExpansionState) => void
  ): { rows: TreeRow[]; openAll: () => void; closeAll: () => void } {
    const createOnToggle = (key: string) => () =>
      setState(this.expansionManager.toggle(expansionState, key));
    const createCloseAll = () => () =>
      setState(this.expansionManager.toggleAll(expansionState, false));
    const createOpenAll = () => () =>
      setState(this.expansionManager.toggleAll(expansionState, true));

    const isExpandedByParent = (path: string) =>
      this.expansionManager.get(
        expansionState,
        this.pathHelper.getParent(path)
      );

    const isChildExpanded = (path: string) =>
      this.expansionManager.get(expansionState, path);

    const treeRowCreator = new TreeRowCreator<A["target"]>(
      this.pathHelper,
      isExpandedByParent,
      isChildExpanded,
      createOnToggle,
      this.extractValues
    );

    const nodes = this.attributeHelper.getMultiAttributeNodes(this.attributes);

    return {
      rows: Object.entries(nodes)
        .map(([key, node]) => treeRowCreator.create(key, node))
        .sort((a, b) => a.id.localeCompare(b.id)),
      openAll: createOpenAll(),
      closeAll: createCloseAll(),
    };
  }
  getEmptyAttributeSets(): string[] {
    return [];
  }
}
