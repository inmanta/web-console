import { isObjectEmpty } from "@/Core";
import {
  AttributeHelper,
  BaseTreeTableHelper,
  PathHelper,
  TreeExpansionManager,
} from "@/UI/Components/TreeTable/Helpers";
import { extractInventoryValues } from "@/UI/Components/TreeTable/TreeRow";
import { InventoryAttributeTree } from "@/UI/Components/TreeTable/types";
import { words } from "@/UI/words";
console.log(BaseTreeTableHelper<InventoryAttributeTree>);
export class InventoryTreeTableHelper extends BaseTreeTableHelper<InventoryAttributeTree> {
  private readonly columns = [
    words("attribute.name"),
    words("attributesTab.candidate"),
    words("attributesTab.active"),
    words("attributesTab.rollback"),
  ];

  constructor(
    pathHelper: PathHelper,
    expansionManager: TreeExpansionManager,
    attributeHelper: AttributeHelper<InventoryAttributeTree>,
    attributes: InventoryAttributeTree["source"]
  ) {
    super(
      pathHelper,
      expansionManager,
      attributeHelper,
      attributes,
      extractInventoryValues
    );
  }

  public getColumns(): string[] {
    return this.columns;
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
