import { isObjectEmpty } from "@/Core";
import {
  AttributeHelper,
  PathHelper,
  TreeTableHelper,
  ExpansionState,
  TreeExpansionManager,
} from "@/UI/Components/TreeTable/Helpers";
import {
  TreeRow,
  extractInventoryValues,
  TreeRowCreator,
} from "@/UI/Components/TreeTable/TreeRow";
import { InventoryAttributeTree } from "@/UI/Components/TreeTable/types";
import { words } from "@/UI/words";

export class InventoryTreeTableHelper implements TreeTableHelper {
  private readonly columns = [
    words("attribute.name"),
    words("attributesTab.candidate"),
    words("attributesTab.active"),
    words("attributesTab.rollback"),
  ];

  constructor(
    private readonly pathHelper: PathHelper,
    private readonly expansionManager: TreeExpansionManager,
    private readonly attributeHelper: AttributeHelper<InventoryAttributeTree>,
    private readonly attributes: InventoryAttributeTree["source"]
  ) {}

  public getColumns(): string[] {
    return this.columns;
  }

  public getExpansionState(): ExpansionState {
    return this.expansionManager.create(
      this.attributeHelper.getPaths(this.attributes)
    );
  }

  public createRows(
    expansionState: ExpansionState,
    setState: (state: ExpansionState) => void
  ): TreeRow[] {
    const createOnToggle = (key: string) => () =>
      setState(this.expansionManager.toggle(expansionState, key));

    const isExpandedByParent = (path: string) =>
      this.expansionManager.get(
        expansionState,
        this.pathHelper.getParent(path)
      );

    const isChildExpanded = (path: string) =>
      this.expansionManager.get(expansionState, path);

    const treeRowCreator = new TreeRowCreator<InventoryAttributeTree["target"]>(
      this.pathHelper,
      isExpandedByParent,
      isChildExpanded,
      createOnToggle,
      extractInventoryValues
    );

    const nodes = this.attributeHelper.getMultiAttributeNodes(this.attributes);

    return Object.entries(nodes)
      .map(([key, node]) => treeRowCreator.create(key, node))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  public getEmptyAttributeSets(): string[] {
    const emptySets = Object.entries(this.attributes)
      .filter(([, value]) => this.isEmpty(value))
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));
    return emptySets;
  }
  private isEmpty(attributeSet: Record<string, unknown>): boolean {
    return !attributeSet || isObjectEmpty(attributeSet);
  }
}
