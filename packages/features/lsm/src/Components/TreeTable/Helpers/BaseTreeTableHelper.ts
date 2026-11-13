import { CatalogAttributeTree } from "@inmanta/web-console-feature-lsm/Components/TreeTable/types";
import { Cell, TreeRow } from "../TreeRow/TreeRow";
import { TreeRowCreator } from "../TreeRow/TreeRowCreator";
import { AttributeHelper } from "./AttributeHelper";
import { AttributeNode } from "./AttributeNode";
import { PathHelper } from "./PathHelper";
import { ExpansionState, TreeExpansionManager } from "./TreeExpansionManager";
import { TreeTableHelper } from "./TreeTableHelper";

export abstract class BaseTreeTableHelper implements TreeTableHelper {
  constructor(
    private readonly pathHelper: PathHelper,
    private readonly expansionManager: TreeExpansionManager,
    private readonly attributeHelper: AttributeHelper,
    protected readonly attributes: CatalogAttributeTree["source"],
    private readonly extractValues: (node: Extract<AttributeNode, { kind: "Leaf" }>) => Cell[]
  ) {}

  abstract getColumns(): string[];

  getExpansionState(): ExpansionState {
    return this.expansionManager.create(this.attributeHelper.getPaths(this.attributes));
  }

  createRows(
    expansionState: ExpansionState,
    setState: (state: ExpansionState) => void
  ): { rows: TreeRow[]; openAll: () => void; closeAll: () => void } {
    const createOnToggle = (key: string) => () =>
      setState(this.expansionManager.toggle(expansionState, key));
    const createCloseAll = () => setState(this.expansionManager.toggleAll(expansionState, false));
    const createOpenAll = () => setState(this.expansionManager.toggleAll(expansionState, true));

    const isExpandedByParent = (path: string) =>
      this.expansionManager.get(expansionState, this.pathHelper.getParent(path));

    const isChildExpanded = (path: string) => this.expansionManager.get(expansionState, path);

    const treeRowCreator = new TreeRowCreator(
      this.pathHelper,
      isExpandedByParent,
      isChildExpanded,
      createOnToggle,
      this.extractValues
    );

    const nodes = this.attributeHelper.getAttributeNodes(this.attributes);

    return {
      rows: Object.entries(nodes).map(([key, node]) => treeRowCreator.create(key, node)),
      openAll: createOpenAll,
      closeAll: createCloseAll,
    };
  }
}
