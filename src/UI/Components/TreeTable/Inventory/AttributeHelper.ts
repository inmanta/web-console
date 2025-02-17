import {
  Attributes,
  EmbeddedEntity,
  EntityLike,
  InterServiceRelation,
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
    private readonly service?: ServiceModel,
  ) {}

  /**
   * Will create an array containing the path keys of the attributes.
   *
   * @param {Attributes} attributes
   * @returns {string[]}
   */
  public getPaths(attributes: Attributes): string[] {
    return Object.keys(
      this.getSingleAttributeNodes("", {
        ...attributes.candidate,
        ...attributes.active,
        ...attributes.rollback,
      }),
    );
  }

  public getMultiAttributeNodes(
    attributes: Attributes,
  ): MultiAttributeNodeDict<InventoryAttributes> {
    return this.mergeNodes(
      this.getSingleAttributeNodes("", attributes.candidate),
      this.getSingleAttributeNodes("", attributes.active),
      this.getSingleAttributeNodes("", attributes.rollback),
    );
  }

  public getAttributeAnnotations(key: string) {
    if (this.service && this.service.attributes) {
      const attr = this.service.attributes.find(
        (attribute) => attribute.name === key,
      );

      return attr?.attribute_annotations || {};
    }

    return {};
  }

  private findKeyInService(
    prefix: string,
    key: string,
  ):
    | Pick<InterServiceRelation, "name" | "entity_type" | "description">
    | undefined {
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
    key: string,
  ):
    | Pick<InterServiceRelation, "name" | "entity_type" | "description">
    | undefined {
    const matchingEmbeddedEntity = service.embedded_entities.find(
      (entity) => entity.name === prefix[0],
    );

    if (matchingEmbeddedEntity)
      return this.findInServiceLike(
        matchingEmbeddedEntity,
        prefix.slice(1),
        key,
      );

    const fromRelations = this.findInRelations(service, key);

    if (fromRelations) {
      return fromRelations;
    }

    return undefined;
  }

  private findInRelations(
    service: Pick<EntityLike, "inter_service_relations">,
    key: string,
  ):
    | Pick<InterServiceRelation, "name" | "entity_type" | "description">
    | undefined {
    const matchingRelation = service.inter_service_relations?.find(
      (relation) => relation.name === key,
    );

    return matchingRelation;
  }

  private findAttributeType(
    service: ServiceModel | EmbeddedEntity | undefined,
    prefix: string[],
    key: string,
  ): string | undefined {
    if (service === undefined) {
      return undefined;
    }

    const matchingEmbeddedEntity = service.embedded_entities.find(
      (entity) => entity.name === prefix[0],
    );

    if (matchingEmbeddedEntity) {
      return this.findAttributeType(
        matchingEmbeddedEntity,
        prefix.slice(1),
        key,
      );
    }

    const adequateAttribute = service.attributes.find(
      (attribute) => attribute.name === key,
    );

    return adequateAttribute?.type;
  }

  private getSingleAttributeNodes(
    prefix: string,
    subject: unknown,
  ): AttributeNodeDict {
    if (!this.isNested(subject)) {
      return {};
    }

    let keys: AttributeNodeDict = {};

    const primaryKeys = Object.keys(subject).sort();

    primaryKeys.forEach((key) => {
      const type = this.findAttributeType(
        this.service,
        prefix
          .split(this.separator)
          .filter((part) => isNaN(part as unknown as number)),
        key,
      );

      if (!this.isNested(subject[key])) {
        const relation = this.findKeyInService(prefix, key);

        keys[`${prefix}${key}`] = {
          kind: "Leaf",
          value: subject[key],
          hasRelation: !!relation,
          entity: relation?.entity_type,
          type,
        };
      } else {
        keys[`${prefix}${key}`] = { kind: "Branch" };
        keys = {
          ...keys,
          ...this.getSingleAttributeNodes(
            `${prefix}${key}${this.separator}`,
            subject[key],
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
    rollbackNodes: AttributeNodeDict,
  ): MultiAttributeNodeDict<InventoryAttributes> {
    //sorting of the attributes moved to helpers to avoid sorting issues - check issue #5030 for example
    const paths = Object.keys({
      ...candidateNodes,
      ...activeNodes,
      ...rollbackNodes,
    }).sort();

    return paths.reduce<MultiAttributeNodeDict<InventoryAttributes>>(
      (acc, cur) => {
        const conform = isMultiLeaf(
          candidateNodes[cur],
          activeNodes[cur],
          rollbackNodes[cur],
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
          hasRelation:
            getHasRelation(candidateNodes[cur]) ||
            getHasRelation(activeNodes[cur]) ||
            getHasRelation(rollbackNodes[cur]),
          entity: chooseEntity([
            getEntity(candidateNodes[cur]),
            getEntity(activeNodes[cur]),
            getEntity(rollbackNodes[cur]),
          ]),
          type:
            getType(candidateNodes[cur]) ||
            getType(activeNodes[cur]) ||
            getType(rollbackNodes[cur]),
        };

        return acc;
      },
      {},
    );
  }
}

/**
 * Performs a check on all nodes and returns true if they are all of the type Leaf.
 *
 * @param {TreeNode | undefined} candidateNode
 * @param {TreeNode | undefined} activeNode
 * @param {TreeNode | undefined} rollbackNode
 * @returns {boolean}
 */
export function isMultiLeaf(
  candidateNode: TreeNode | undefined,
  activeNode: TreeNode | undefined,
  rollbackNode: TreeNode | undefined,
): boolean {
  return isLeaf(candidateNode) && isLeaf(activeNode) && isLeaf(rollbackNode);
}

/**
 * Returns the type of the Node if the kind is a Leaf.
 * Otherwise it will return undefined.
 *
 * @param {TreeNode | undefined} node
 * @returns {string | undefined}
 */
function getType(node: TreeNode | undefined): string | undefined {
  if (typeof node === "undefined") return undefined;
  if (node.kind !== "Leaf") return undefined;

  return node.type;
}

/**
 * Will return the value of the Node if the kind is a Leaf.
 * Otherwise it will return undefined.
 *
 * @param {TreeNode | undefined} node
 * @returns {unknown}
 */
export function getValue(node: TreeNode | undefined): unknown {
  if (typeof node === "undefined") return undefined;
  if (node.kind !== "Leaf") return undefined;

  return node.value;
}

/**
 * Performs a check if the node is of the Leaf kind.
 * When the typeof node is undefined it will by default deduce it's a Leaf.
 *
 * @param {TreeNode | undefined} node
 * @returns {boolean}
 */
export function isLeaf(node: TreeNode | undefined): boolean {
  if (typeof node === "undefined") return true;

  return node.kind === "Leaf";
}

/**
 * Performs a check if the node has relations.
 * Returns undefined if not.
 *
 * @param {TreeNode | undefined} node
 * @returns {boolean | undefined}
 */
function getHasRelation(node: TreeNode | undefined): boolean | undefined {
  if (typeof node === "undefined") return undefined;
  if (node.kind !== "Leaf") return undefined;

  return node.hasRelation;
}

/**
 * Will return the name of the entity if the Node has one and is of kind Leaf.
 * Otherwise, it will return undefined.
 *
 * @param {TreeNode | undefined} node
 * @returns {string | undefined}
 */
function getEntity(node: TreeNode | undefined): string | undefined {
  if (typeof node === "undefined") return undefined;
  if (node.kind !== "Leaf") return undefined;

  return node.entity;
}

/**
 * Returns the name of the entity if there is one.
 * It's expected to be used in combination with the getEntity method.
 *
 * @param {(string | undefined)[] } entities
 * @returns {string | undefined}
 */
function chooseEntity(entities: (string | undefined)[]): string | undefined {
  // If there is an entity for either of the { candidate, active, rollback } attributes, it will be the same
  const notUndefined = entities.filter(isNotUndefined);

  if (notUndefined.length > 0) {
    return notUndefined[0];
  }

  return undefined;
}
