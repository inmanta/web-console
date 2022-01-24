import { Attributes } from "@/Core";
import { TreeRow, TreeRowCreator } from "@/UI/Components/TreeTable/TreeRow";
import { words } from "@/UI/words";
import { AttributeHelper } from "./AttributeHelper";
import { PathHelper } from "./PathHelper";
import { ExpansionState, TreeExpansionManager } from "./TreeExpansionManager";

export class TreeTableHelper {
  private readonly columns = [
    words("attribute.name"),
    words("attributesTab.candidate"),
    words("attributesTab.active"),
    words("attributesTab.rollback"),
  ];

  constructor(
    private readonly pathHelper: PathHelper,
    private readonly expansionManager: TreeExpansionManager,
    private readonly attributeHelper: AttributeHelper,
    private readonly attributes: Attributes
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

    const treeRowCreator = new TreeRowCreator(
      this.pathHelper,
      isExpandedByParent,
      isChildExpanded,
      createOnToggle
    );

    const nodes = this.attributeHelper.getMultiAttributeNodes(this.attributes);

    return Object.entries(nodes).map(([key, node]) =>
      treeRowCreator.create(key, node)
    );
  }
}
