import { words } from "@inmanta/web-console-core";
import { AttributeHelper } from "@inmanta/web-console-feature-lsm/Components/TreeTable/Helpers/AttributeHelper";
import { PathHelper } from "@inmanta/web-console-feature-lsm/Components/TreeTable/Helpers/PathHelper";
import { TreeExpansionManager } from "@inmanta/web-console-feature-lsm/Components/TreeTable/Helpers/TreeExpansionManager";
import { extractCatalogValues } from "@inmanta/web-console-feature-lsm/Components/TreeTable/TreeRow/TreeRowCreator";
import { CatalogAttributeTree } from "@inmanta/web-console-feature-lsm/Components/TreeTable/types";
import { BaseTreeTableHelper } from "../Helpers/BaseTreeTableHelper";

export class CatalogTreeTableHelper extends BaseTreeTableHelper<CatalogAttributeTree> {
  private readonly columns = [
    words("name"),
    words("type"),
    words("catalog.table.modifier"),
    words("description"),
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
