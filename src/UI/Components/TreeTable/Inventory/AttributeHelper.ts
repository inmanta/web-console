import {
  Attributes,
  EntityLike,
  isNotUndefined,
  ServiceModel,
  TreeNode,
} from "@/Core";
import { AttributeHelper } from "@/UI/Components/TreeTable/Helpers/AttributeHelper";
import {
  MultiAttributeNodeDict,
  AttributeNodeDict,
  InventoryAttributes,
} from "@/UI/Components/TreeTable/Helpers/AttributeNode";
import { InventoryAttributeTree } from "@/UI/Components/TreeTable/types";

export class InventoryAttributeHelper
  implements AttributeHelper<InventoryAttributeTree>
{
  constructor(
    private readonly separator: string,
    private readonly service?: ServiceModel
  ) {}

  public getPaths(attributes: Attributes): string[] {
    return Object.keys(
      this.getSingleAttributeNodes("", {
        ...attributes.candidate,
        ...attributes.active,
        ...attributes.rollback,
      })
    );
  }

  public getMultiAttributeNodes(
    attributes: Attributes
  ): MultiAttributeNodeDict<InventoryAttributes> {
    return this.mergeNodes(
      this.getSingleAttributeNodes("", attributes.candidate),
      this.getSingleAttributeNodes("", attributes.active),
      this.getSingleAttributeNodes("", attributes.rollback)
    );
  }

  private findKeyInService(prefix: string, key: string) {
    if (!this.service) {
      return;
    }
    if (prefix.length === 0) {
      return this.findInRelations(this.service, key);
    }
    const prefixParts = prefix
      .split(this.separator)
      .filter((part) => isNaN(part as unknown as number));
    const val = this.findInServiceLike(this.service, prefixParts, key);
    return val;
  }

  private findInServiceLike(
    service: Pick<EntityLike, "embedded_entities" | "inter_service_relations">,
    prefix: string[],
    key: string
  ) {
    const matchingEmbeddedEntity = service.embedded_entities.find(
      (entity) => entity.name === prefix[0]
    );
    if (matchingEmbeddedEntity)
      return this.findInServiceLike(
        matchingEmbeddedEntity,
        prefix.slice(1),
        key
      );
    if (!matchingEmbeddedEntity) {
      const fromRelations = this.findInRelations(service, key);
      if (fromRelations) {
        return fromRelations;
      }
      return;
    }
  }

  private findInRelations(
    service: Pick<EntityLike, "inter_service_relations">,
    key: string
  ) {
    const matchingRelation = service.inter_service_relations?.find(
      (relation) => relation.name === key
    );
    return matchingRelation;
  }

  private getSingleAttributeNodes(
    prefix: string,
    subject: unknown
  ): AttributeNodeDict {
    if (!this.isNested(subject)) return {};
    let keys: AttributeNodeDict = {};
    const primaryKeys = Object.keys(subject).sort();
    primaryKeys.forEach((key) => {
      if (!this.isNested(subject[key])) {
        const relation = this.findKeyInService(prefix, key);
        keys[`${prefix}${key}`] = {
          kind: "Leaf",
          value: subject[key],
          hasOnClick: !!relation,
          entity: relation?.entity_type,
        };
      } else {
        keys[`${prefix}${key}`] = { kind: "Branch" };
        keys = {
          ...keys,
          ...this.getSingleAttributeNodes(
            `${prefix}${key}${this.separator}`,
            subject[key]
          ),
        };
      }
    });
    return keys;
  }

  /**
   * isNested checks whether a value is "nested" or not.
   *
   * An object is considered nested when:
   * - not null
   * - has keys, so not an empty object {}
   *
   * An array is considered nested when:
   * - array contains nested values
   *
   * Example:
   * Nested:
   * - [{a:"hello"}]
   * - {a: "hello"}
   *
   * Not Nested:
   * - []
   * - {}
   * - ["hello"]
   * - null
   */
  private isNested(value: unknown): value is Record<string, unknown> {
    return (
      typeof value === "object" &&
      value !== null &&
      Object.keys(value).length > 0 &&
      (!Array.isArray(value) || value.some((v) => this.isNested(v)))
    );
  }

  private mergeNodes(
    candidateNodes: AttributeNodeDict,
    activeNodes: AttributeNodeDict,
    rollbackNodes: AttributeNodeDict
  ): MultiAttributeNodeDict<InventoryAttributes> {
    const paths = Object.keys({
      ...candidateNodes,
      ...activeNodes,
      ...rollbackNodes,
    });

    return paths.reduce<MultiAttributeNodeDict<InventoryAttributes>>(
      (acc, cur) => {
        const conform = isMultiLeaf(
          candidateNodes[cur],
          activeNodes[cur],
          rollbackNodes[cur]
        );

        if (!conform) {
          acc[cur] = { kind: "Branch" };
          return acc;
        }

        acc[cur] = {
          kind: "Leaf",
          value: {
            candidate: getValue(candidateNodes[cur]),
            active: getValue(activeNodes[cur]),
            rollback: getValue(rollbackNodes[cur]),
          },
          hasOnClick:
            getHasOnClick(candidateNodes[cur]) ||
            getHasOnClick(activeNodes[cur]) ||
            getHasOnClick(rollbackNodes[cur]),
          entity: chooseEntity([
            getEntity(candidateNodes[cur]),
            getEntity(activeNodes[cur]),
            getEntity(rollbackNodes[cur]),
          ]),
        };
        return acc;
      },
      {}
    );
  }
}

export function isMultiLeaf(
  candidateNode: TreeNode | undefined,
  activeNode: TreeNode | undefined,
  rollbackNode: TreeNode | undefined
): boolean {
  return isLeaf(candidateNode) && isLeaf(activeNode) && isLeaf(rollbackNode);
}

export function getValue(node: TreeNode | undefined): unknown {
  if (typeof node === "undefined") return undefined;
  if (node.kind !== "Leaf") return undefined;
  return node.value;
}

export function isLeaf(node: TreeNode | undefined): boolean {
  if (typeof node === "undefined") return true;
  return node.kind === "Leaf";
}

function getHasOnClick(node: TreeNode | undefined): boolean | undefined {
  if (typeof node === "undefined") return undefined;
  if (node.kind !== "Leaf") return undefined;
  return node.hasOnClick;
}

function getEntity(node: TreeNode | undefined): string | undefined {
  if (typeof node === "undefined") return undefined;
  if (node.kind !== "Leaf") return undefined;
  return node.entity;
}

function chooseEntity(entities: (string | undefined)[]): string | undefined {
  // If there is an entity for either of the { candidate, active, rollback } attributes, it will be the same
  const notUndefined = entities.filter(isNotUndefined);
  if (notUndefined.length > 0) {
    return notUndefined[0];
  }
  return undefined;
}
