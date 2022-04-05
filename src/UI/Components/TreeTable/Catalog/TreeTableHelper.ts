import { AttributeHelper } from "@/UI/Components/TreeTable/Helpers/AttributeHelper";
import { PathHelper } from "@/UI/Components/TreeTable/Helpers/PathHelper";
import {
  ExpansionState,
  TreeExpansionManager,
} from "@/UI/Components/TreeTable/Helpers/TreeExpansionManager";
import { TreeTableHelper } from "@/UI/Components/TreeTable/Helpers/TreeTableHelper";
import { TreeRow } from "@/UI/Components/TreeTable/TreeRow";
import {
  extractCatalogValues,
  TreeRowCreator,
} from "@/UI/Components/TreeTable/TreeRow/TreeRowCreator";
import { CatalogAttributeTree } from "@/UI/Components/TreeTable/types";
import { words } from "@/UI/words";

export class CatalogTreeTableHelper implements TreeTableHelper {
  private readonly columns = [
    words("attribute.name"),
    words("catalog.table.type"),
    words("catalog.table.description"),
  ];

  constructor(
    private readonly pathHelper: PathHelper,
    private readonly expansionManager: TreeExpansionManager,
    private readonly attributeHelper: AttributeHelper<CatalogAttributeTree>,
    private readonly attributes: CatalogAttributeTree["source"]
  ) {}

  getColumns(): string[] {
    return this.columns;
  }

  public getExpansionState(): ExpansionState {
    return this.expansionManager.create(
      this.attributeHelper.getPaths(this.attributes)
    );
  }

  createRows(
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

    const treeRowCreator = new TreeRowCreator<CatalogAttributeTree["target"]>(
      this.pathHelper,
      isExpandedByParent,
      isChildExpanded,
      createOnToggle,
      extractCatalogValues
    );

    const nodes = this.attributeHelper.getMultiAttributeNodes(this.attributes);

    return Object.entries(nodes)
      .map(([key, node]) => treeRowCreator.create(key, node))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  getEmptyAttributeSets(): string[] {
    return [];
  }
}
