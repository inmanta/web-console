import { AttributeHelper } from "@/UI/Components/TreeTable/Helpers/AttributeHelper";
import { PathHelper } from "@/UI/Components/TreeTable/Helpers/PathHelper";
import { TreeExpansionManager } from "@/UI/Components/TreeTable/Helpers/TreeExpansionManager";
import { extractCatalogValues } from "@/UI/Components/TreeTable/TreeRow/TreeRowCreator";
import { CatalogAttributeTree } from "@/UI/Components/TreeTable/types";
import { words } from "@/UI/words";
import { BaseTreeTableHelper } from "../Helpers/BaseTreeTableHelper";

export class CatalogTreeTableHelper extends BaseTreeTableHelper<CatalogAttributeTree> {
  private readonly columns = [
    words("attribute.name"),
    words("catalog.table.type"),
    words("catalog.table.modifier"),
    words("catalog.table.description"),
  ];

  constructor(
    pathHelper: PathHelper,
    expansionManager: TreeExpansionManager,
    attributeHelper: AttributeHelper<CatalogAttributeTree>,
    attributes: CatalogAttributeTree["source"]
  ) {
    super(pathHelper, expansionManager, attributeHelper, attributes, extractCatalogValues);
  }

  public getColumns(): string[] {
    return this.columns;
  }
}
