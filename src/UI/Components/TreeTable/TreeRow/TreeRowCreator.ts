import { Attributes } from "@/Core/Domain/InventoryTable";
import {
  CatalogAttributes,
  InventoryAttributes,
  MultiAttributeNode,
} from "@/UI/Components/TreeTable/Helpers/AttributeNode";
import { PathHelper } from "@/UI/Components/TreeTable/Helpers/PathHelper";
import { AttributeTree } from "@/UI/Components/TreeTable/types";
import { Cell, TreeRow } from "./TreeRow";

export class TreeRowCreator<T extends AttributeTree["target"]> {
  constructor(
    private readonly pathHelper: PathHelper,
    private readonly isExpandedByParent: (path: string) => boolean,
    private readonly isChildExpanded: (path: string) => boolean,
    private readonly createOnToggle: (path: string) => () => void,
    private readonly extractValues: (
      node: Extract<MultiAttributeNode<T>, { kind: "Leaf" }>,
    ) => Cell[],
    private readonly attributes: Attributes,
  ) {}

  /**
   * When a Branch is not conform, this method will return you the content of the warning object.
   * If the Branch targeted by the path is conform, all attributes are either undefined or an object, then this method will return undefined.
   *
   * @param {string} path - Usually a dict that separates attribute names by a $ sign.
   * @returns {string | undefined}
   */
  getBranchWarningObject = (path: string): string | undefined => {
    const pathArr = path.split("$");

    if (!pathArr || !pathArr.length) {
      return "";
    }

    const candidate = (this.attributes.candidate as unknown) || {};
    const active = (this.attributes.active as unknown) || {};
    const rollback = (this.attributes.rollback as unknown) || {};

    const candidateValue = pathArr.reduce(
      (obj, key) => (obj && obj[key] !== "undefined" ? obj[key] : undefined),
      candidate,
    );

    const activeValue = pathArr.reduce(
      (obj, key) => (obj && obj[key] !== "undefined" ? obj[key] : undefined),
      active,
    );

    const rollBackValue = pathArr.reduce(
      (obj, key) => (obj && obj[key] !== "undefined" ? obj[key] : undefined),
      rollback,
    );

    /**
     * The value can normally only be of type object or undefined if it's conform.
     * If it's a string or a number it means that the type migrated at some point.
     * That's when we want to display a warning to the user to inform there is a mismatch.
     */
    if (
      typeof candidateValue === "string" ||
      typeof activeValue === "string" ||
      typeof rollBackValue === "string"
    ) {
      const candidateStringified =
        typeof candidateValue !== "undefined"
          ? JSON.stringify(candidateValue)
          : candidateValue;
      const activeStringified =
        typeof activeValue !== "undefined"
          ? JSON.stringify(activeValue)
          : activeValue;
      const rollbackStringified =
        typeof rollBackValue !== "undefined"
          ? JSON.stringify(rollBackValue)
          : rollBackValue;

      return `Candidate attributes : ${candidateStringified} \n  Active attributes : ${activeStringified} \n Rollback attributes : ${rollbackStringified}`;
    }

    return;
  };

  /**
   * Depending on the targeted attribute and if it's nested or not,
   * this method will return you a Leaf/Flat or a Branch/Root Row.
   * There is an additional check for nested levels to define if they are conform or not.
   * A warning property is added to the primaryCell object for these sections.
   * If the warning has a string value, this will be handled further in the TreeRowView component.
   *
   * @param {string} path
   * @param {MultiAttributeNode<T>} node
   * @returns {TreeRow} a TreeRow object
   */
  create(path: string, node: MultiAttributeNode<T>): TreeRow {
    if (node.kind === "Leaf") {
      if (this.pathHelper.isNested(path)) {
        return {
          kind: "Leaf",
          id: path,
          isExpandedByParent: this.isExpandedByParent(path),
          level: this.pathHelper.getLevel(path),
          primaryCell: { label: "name", value: this.pathHelper.getSelf(path) },
          valueCells: this.extractValues(node),
          type: node.type,
        };
      } else {
        return {
          kind: "Flat",
          id: path,
          primaryCell: { label: "name", value: path },
          valueCells: this.extractValues(node),
          type: node.type,
        };
      }
    } else {
      const warning = this.getBranchWarningObject(path);

      if (this.pathHelper.isNested(path)) {
        return {
          kind: "Branch",
          id: path,
          isExpandedByParent: this.isExpandedByParent(path),
          isChildExpanded: this.isChildExpanded(path),
          onToggle: this.createOnToggle(path),
          level: this.pathHelper.getLevel(path),
          primaryCell: {
            label: "name",
            value: this.pathHelper.getSelf(path),
            warning: warning,
          },
        };
      } else {
        return {
          kind: "Root",
          id: path,
          isChildExpanded: this.isChildExpanded(path),
          onToggle: this.createOnToggle(path),
          primaryCell: { label: "name", value: path, warning: warning },
        };
      }
    }
  }
}

function format(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "undefined") return "";
  if (typeof value === "object") {
    if (value === null) return "null";
    if (Object.keys(value).length === 0) return "{}";
    if (Array.isArray(value)) return value.join(", ");
  }
  return "";
}

export function extractCatalogValues(
  node: Extract<MultiAttributeNode<CatalogAttributes>, { kind: "Leaf" }>,
): Cell[] {
  return [
    {
      label: "type",
      value: format(node.value.type),
      hasRelation: node.hasRelation,
    },
    {
      label: "description",
      value: format(node.value.description),
    },
  ];
}

export function extractInventoryValues(
  node: Extract<MultiAttributeNode<InventoryAttributes>, { kind: "Leaf" }>,
): Cell[] {
  return [
    {
      label: "candidate",
      value: format(node.value.candidate),
      hasRelation: node.hasRelation,
      serviceName: node.entity,
    },
    {
      label: "active",
      value: format(node.value.active),
      hasRelation: node.hasRelation,
      serviceName: node.entity,
    },
    {
      label: "rollback",
      value: format(node.value.rollback),
      hasRelation: node.hasRelation,
      serviceName: node.entity,
    },
  ];
}
