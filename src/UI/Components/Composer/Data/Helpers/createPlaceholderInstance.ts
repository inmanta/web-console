import { v4 as uuidv4 } from "uuid";
import { ServiceModel, InstanceAttributeModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Queries";

/**
 * Creates a placeholder instance from a service model for new instance creation
 *
 * @param serviceModel - The service model to create a placeholder from
 * @param instanceId - Optional custom instanceId, otherwise generates a new UUID
 * @returns A placeholder InstanceWithRelations object
 */
export const createPlaceholderInstance = (
  serviceModel: ServiceModel,
  instanceId?: string
): InstanceWithRelations => {
  const id = instanceId || uuidv4();

  // Create empty attributes based on the service model
  const instanceAttributes: InstanceAttributeModel = {};

  // Initialize all attributes with empty/default values
  serviceModel.attributes.forEach((attr) => {
    // Don't set any default values yet - let the form handle defaults
    // This ensures we start with a clean slate
    instanceAttributes[attr.name] = null;
  });

  return {
    instance: {
      id,
      service_entity: serviceModel.name,
      version: 0,
      environment: "", // Will be set by environment context
      active_attributes: null,
      candidate_attributes: instanceAttributes,
      rollback_attributes: null,
      callback: [],
      deleted: false,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
      state: "creating",
      referenced_by: null,
    },
    interServiceRelations: [],
  };
};
