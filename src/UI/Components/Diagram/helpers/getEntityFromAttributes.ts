import { InstanceAttributeModel } from "@/Core";

/**
 * Type safe way to get entity attributes from InstanceAttributeModel
 * Every attribute is of type unknown, 
 * so we need to check if it is an object and if it is an array of objects
 * to know if we are dealing with nested entities or not
 * 
 * @param {string} entityName - name of the entity to get attributes for
 * @param {InstanceAttributeModel} attributes - attributes of the entity
 * 
 * @returns {InstanceAttributeModel | InstanceAttributeModel[] | null} - attributes of the entity
 */
export const getEntityAttributes = (entityName: string, attributes: InstanceAttributeModel): InstanceAttributeModel | InstanceAttributeModel[] | null => {
    const value = attributes[entityName];

    // Type guard: check if value is InstanceAttributeModel
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as InstanceAttributeModel;
    }

    // Type guard: check if value is array of InstanceAttributeModel
    if (Array.isArray(value) && value.every(item => item && typeof item === 'object')) {
        return value as InstanceAttributeModel[];
    }

    return null;
};