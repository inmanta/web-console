import { InstanceAttributeModel, ServiceInstanceModel, ServiceModel } from "@/Core";
import { InstanceLog } from "@/Core/Domain/HistoryLog";

// A type for the possible AttributeSets.
export type AttributeSets = "active_attributes" | "candidate_attributes" | "rollback_attributes";

// Interface representing the TreeRowData, meant to populate a TreeTable
export interface TreeRowData {
  id: string;
  name: string;
  value: unknown;
  type: "Value" | "Embedded" | "Relation";
  serviceName?: string;
  children?: TreeRowData[];
}

// The available views mapped to toggleKeys for the AttributesTabContent.
export enum AttributeViewToggles {
  TABLE = "Table",
  COMPARE = "Compare",
  EDITOR = "JSON",
}

// Type representing the possible views for the AttributesTabContent.
export type AttributeViews = "Table" | "Compare" | "JSON";

/**
 * Method to get the attributeSets for a given version.
 *
 * @param {InstanceLog[]} logs - The history logs containing the attributeSets.
 * @param {string} version - The version for which you need the attributeSets.
 * @returns {Partial<Record<AttributeSets, InstanceAttributeModel>>} - The available attributeSets.
 */
export const getAvailableAttributesSets = (
  logs: InstanceLog[],
  version: string
): Partial<Record<AttributeSets, InstanceAttributeModel>> => {
  const selectedLog: InstanceLog | null =
    logs.find((log: InstanceLog) => String(log.version) === version) || null;

  if (!selectedLog) return {};

  const sets = {};

  if (selectedLog.active_attributes) {
    sets["active_attributes"] = selectedLog.active_attributes;
  }

  if (selectedLog.candidate_attributes) {
    sets["candidate_attributes"] = selectedLog.candidate_attributes;
  }

  if (selectedLog.rollback_attributes) {
    sets["rollback_attributes"] = selectedLog.rollback_attributes;
  }

  return sets;
};

/**
 * Method to get the attributeSets from instance.
 * It's being used to get the attributeSets from the instance model when selected version is the latest one,
 * to avoid any differences that could occur in the logs
 *
 * @param {ServiceInstanceModel} logs - Service Instance
 * @returns {Partial<Record<AttributeSets, InstanceAttributeModel>>} - The available attributeSets.
 */
export const getAttributeSetsFromInstance = (
  instance: ServiceInstanceModel
): Partial<Record<AttributeSets, InstanceAttributeModel>> => {
  const sets = {};

  if (instance.active_attributes) {
    sets["active_attributes"] = instance.active_attributes;
  }

  if (instance.candidate_attributes) {
    sets["candidate_attributes"] = instance.candidate_attributes;
  }

  if (instance.rollback_attributes) {
    sets["rollback_attributes"] = instance.rollback_attributes;
  }

  return sets;
};

/**
 * Recursive Method to format the data to prepare it for a TreeTable Component.
 *
 * @param {Record<string, unknown>} attributes - The attributes to format.
 * @returns {TreeRowData[]} - formatted TreeRowData for a TreeTable.
 */
export const formatTreeRowData = (
  attributes: Record<string, unknown>,
  serviceModel: Partial<ServiceModel>,
  path: string = ""
): TreeRowData[] => {
  const result: TreeRowData[] = [];

  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      const value = attributes[key];

      //  default
      const node: TreeRowData = {
        value: value,
        id: path + key,
        name: key,
        type: "Value",
        children: [],
      };

      // we need to check if the item is an inter-service relation
      const relationNode = serviceModel.inter_service_relations?.find(
        (relation) => relation.name === key
      );

      if (relationNode) {
        node.type = "Relation";
        node.serviceName = relationNode.entity_type;
      }

      // If we are facing an object (Arrays are also considered as objects in JS),
      // it means we need to display a collapsible section.
      // The children property tells whether a section is a value, or a collapsible section.
      if (value && typeof value === "object" && !relationNode) {
        node.type = "Embedded";

        // In case we are dealing with an array of arrays, we want to keep track of the index to display it in the table.
        if (Array.isArray(value)) {
          for (let index = 0; index < value.length; index++) {
            const item = value[index];
            let model: Partial<ServiceModel> = serviceModel;

            // If the item is an object, we need to add the properties into the children
            if (typeof item === "object" && item !== null) {
              const embeddedNode = model.embedded_entities?.find(
                (embeddedEntity) => embeddedEntity.name === key
              );

              if (embeddedNode) {
                model = embeddedNode;
              }

              node?.children?.push({
                name: `${index}`,
                id: path + key + "." + index,
                type: "Embedded",
                value: item,
                children: formatTreeRowData(
                  item as Record<string, unknown>,
                  model,
                  path + key + "." + index + "."
                ),
              });
            } else {
              // If the item is a primitive value, add it directly. They don't need a collapsible section.
              node?.children?.push({
                name: `${index}`,
                id: path + key + "." + index,
                value: item,
                type: "Value",
              });
            }
          }
        } else {
          // this case is when we are dealing with a normal object. We call the recursion. This often happens when there's only one embedded entity in the list.
          node?.children?.push(
            ...formatTreeRowData(value as Record<string, unknown>, serviceModel, path + key + ".")
          );
        }
      }

      result.push(node);
    }
  }

  return result;
};

/**
 * Sort method to sort the treeRows recursively based on a given direction.
 *
 * @param {TreeRowData[]} tableData
 * @param {"asc" | "desc"} direction sort direction.
 * @returns {TreeRowData[]} sorted TreeRowData[]
 */
export const sortTreeRows = (
  tableData: TreeRowData[],
  direction: "asc" | "desc"
): TreeRowData[] => {
  // Helper function to compare values based on direction
  const compare = (a: TreeRowData, b: TreeRowData) => {
    if (a.name < b.name) {
      return direction === "asc" ? -1 : 1;
    }

    if (a.name > b.name) {
      return direction === "asc" ? 1 : -1;
    }

    return 0;
  };

  // Sort the data recursively
  const sortData = (data: TreeRowData[]): TreeRowData[] => {
    return data
      .map((row) => ({
        ...row,
        children: row.children ? sortData(row.children) : [],
      }))
      .sort(compare);
  };

  return sortData(tableData);
};

/**
 * Helper method to get the list of versions available in the history logs.
 *
 * @param {InstanceLog[]} instanceLogs
 * @returns string[] An array with the available versions in the history logs.
 */
export const getAvailableVersions = (instanceLogs: InstanceLog[]): string[] => {
  const availableVersions: string[] = [];

  instanceLogs.forEach((log) => {
    availableVersions.push(String(log.version));
  });

  return availableVersions;
};
