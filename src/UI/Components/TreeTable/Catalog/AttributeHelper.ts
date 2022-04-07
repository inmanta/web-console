import { AttributeHelper } from "@/UI/Components/TreeTable/Helpers/AttributeHelper";
import { MultiAttributeNodeDict } from "@/UI/Components/TreeTable/Helpers/AttributeNode";
import { CatalogAttributeTree } from "@/UI/Components/TreeTable/types";

export class CatalogAttributeHelper
  implements AttributeHelper<CatalogAttributeTree>
{
  constructor(private readonly separator: string) {}

  public getPaths(container: CatalogAttributeTree["source"]): string[] {
    return Object.keys(this.getNodesFromEntities("", container)).sort(
      (pathA, pathB) => pathA.localeCompare(pathB)
    );
  }

  public getMultiAttributeNodes(
    container: CatalogAttributeTree["source"]
  ): MultiAttributeNodeDict<CatalogAttributeTree["target"]> {
    return this.getNodesFromEntities("", container);
  }

  private getNodesFromEntities(
    prefix: string,
    container: CatalogAttributeTree["source"]
  ): MultiAttributeNodeDict<CatalogAttributeTree["target"]> {
    let entries = container.attributes.reduce((acc, cur) => {
      acc[`${prefix}${cur.name}`] = {
        kind: "Leaf",
        value: {
          type: cur.type,
          description: cur.description,
        },
      };
      return acc;
    }, {});
    if (container.embedded_entities.length > 0) {
      container.embedded_entities.forEach((entity) => {
        entries[`${prefix}${entity.name}`] = { kind: "Branch" };
        entries = {
          ...entries,
          ...this.getNodesFromEntities(
            `${prefix}${entity.name}${this.separator}`,
            entity
          ),
        };
      });
    }
    return entries;
  }
}
