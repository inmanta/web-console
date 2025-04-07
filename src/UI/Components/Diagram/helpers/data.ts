import { dia } from "@inmanta/rappid";
import { isEqual } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { EmbeddedEntity, InstanceAttributeModel, ServiceModel } from "@/Core";
import {
  ComposerServiceOrderItem,
  SavedCoordinates,
  ActionEnum,
} from "@/UI/Components/Diagram/interfaces";
import { words } from "@/UI/words";
import { ServiceEntityBlock } from "../shapes";

/**
 * Function that will merge state from Instance Composer to proper object for order_api endpoint.
 * Instance composer state is being split into multiple objects that could be embedded into other available, so we need to recursively
 * go through all of them to group, and sort them
 * @param {ComposerServiceOrderItem} parentInstance Instance that is the main object and to which other instance are eventually connected
 * @param {ComposerServiceOrderItem[]} instances all of the instances that were created/edited in the instance, not including parentInstance
 * @param {ServiceModel | EmbeddedEntity} serviceModel - ServiceModel or EmbeddedEntity that is the model for the current iteration to build upon
 * @param {boolean=} isEmbeddedEntity boolean informing whether instance passed is embedded or not
 * @returns {ComposerServiceOrderItem} - object that could be sent to the backend or embedded into other object that could be sent
 */
export const shapesDataTransform = (
  parentInstance: ComposerServiceOrderItem,
  instances: ComposerServiceOrderItem[],
  serviceModel: ServiceModel | EmbeddedEntity,
  isEmbeddedEntity = false,
): ComposerServiceOrderItem => {
  let areEmbeddedEdited = false;
  const matchingInstances = instances.filter(
    (checkedInstance) =>
      checkedInstance.embeddedTo === parentInstance.instance_id,
  );

  const notMatchingInstances = instances.filter(
    (checkedInstance) =>
      checkedInstance.embeddedTo !== parentInstance.instance_id,
  );

  //iterate through matching (embedded)instances and group them according to property type to be able to put them in the Array if needed at once
  const groupedEmbedded: { [instanceId: string]: ComposerServiceOrderItem[] } =
    matchingInstances.reduce((reducer, instance) => {
      reducer[instance.service_entity] = reducer[instance.service_entity] || [];
      reducer[instance.service_entity].push(instance);

      return reducer;
    }, Object.create({}));

  for (const [key, instancesToEmbed] of Object.entries(groupedEmbedded)) {
    if (parentInstance.attributes) {
      const updated: InstanceAttributeModel[] = [];
      const embeddedModel = serviceModel.embedded_entities.find(
        (entity) => entity.name === instancesToEmbed[0].service_entity,
      );

      //iterate through instancesToEmbed to recursively join potential nested embedded entities into correct objects in correct state
      instancesToEmbed.forEach((instanceToEmbed) => {
        if (embeddedModel) {
          const updatedInstance = shapesDataTransform(
            instanceToEmbed,
            notMatchingInstances,
            embeddedModel,
            !!embeddedModel,
          );

          if (!areEmbeddedEdited) {
            areEmbeddedEdited =
              !parentInstance.action && updatedInstance.action !== null;
          }

          if (
            updatedInstance.action !== "delete" &&
            updatedInstance.attributes
          ) {
            updated.push(updatedInstance.attributes);
          }
        }
      });

      parentInstance.attributes[key] =
        updated.length === 1 && isSingularRelation(embeddedModel)
          ? updated[0]
          : updated;
    }
  }

  //convert relatedTo property into valid attribute
  if (parentInstance.relatedTo) {
    const tempHolderForRelation: InstanceAttributeModel = {}; //this is solution for the case when we are updating the instance with Array of the relations

    serviceModel.inter_service_relations.forEach((relation) => {
      if (parentInstance.relatedTo) {
        const relations = Array.from(parentInstance.relatedTo).filter(
          ([_id, attributeName]) => attributeName === relation.name,
        );

        if (relation.upper_limit !== 1) {
          tempHolderForRelation[relation.name] = relations.map(([id]) => id);
        } else {
          tempHolderForRelation[relation.name] = relations[0]
            ? relations[0][0]
            : undefined;
        }
      }
    });

    Array.from(Object.entries(tempHolderForRelation)).forEach(
      ([key, value]) => {
        if (parentInstance.attributes) {
          parentInstance.attributes[key] = value;
        }
      },
    );
  }

  //if any of its embedded instances were edited, and its action is indicating no changes to main attributes, change it to "update"
  if (areEmbeddedEdited) {
    parentInstance.action = "update";
  }

  //if its action is "update" and instance isn't embedded change value property to edit as that's what api expect in the body
  if (parentInstance.action === "update" && !isEmbeddedEntity) {
    if (!!parentInstance.attributes && !parentInstance.edits) {
      parentInstance.edits = [
        {
          edit_id: `${parentInstance.instance_id}_order_update-${uuidv4()}`,
          operation: "replace",
          target: ".",
          value: parentInstance.attributes,
        },
      ];
    }

    delete parentInstance.attributes;
  }

  delete parentInstance.embeddedTo;
  delete parentInstance.relatedTo;

  return parentInstance;
};

/**
 * Function that takes Map of standalone instances that include core, embedded and inter-service related entities and
 * bundle in proper Instance Objects that could be accepted by the order_api request
 *
 * @param {Map<string, ComposerServiceOrderItem>}instances Map of Instances
 * @param {ServiceModel[]} services - Array of service models
 * @returns {ComposerServiceOrderItem[]}
 */
export const getServiceOrderItems = (
  instances: Map<string, ComposerServiceOrderItem>,
  services: ServiceModel[],
): ComposerServiceOrderItem[] => {
  const mapToArray = Array.from(instances, (instance) => instance[1]); //only value, the id is stored in the object anyway
  const deepCopiedMapToArray: ComposerServiceOrderItem[] = JSON.parse(
    JSON.stringify(mapToArray),
  ); //only value, the id is stored in the object anyway

  //we need also deep copy relatedTo Map separately
  deepCopiedMapToArray.forEach((instance, index) => {
    instance.relatedTo = mapToArray[index].relatedTo
      ? JSON.parse(
        JSON.stringify(
          Array.from(mapToArray[index].relatedTo as Map<string, string>),
        ),
      )
      : mapToArray[index].relatedTo;
  });
  const topServicesNames = services.map((service) => service.name);

  // topInstances are instances that have top-level attributes from given serviceModel, and theoretically are the ones accepting embedded-entities
  const topInstances = deepCopiedMapToArray.filter((instance) =>
    topServicesNames.includes(instance.service_entity),
  );
  const embeddedInstances = deepCopiedMapToArray.filter(
    (instance) => !topServicesNames.includes(instance.service_entity),
  );

  const mergedInstances: ComposerServiceOrderItem[] = [];

  topInstances.forEach((instance) => {
    const serviceModel = services.find(
      (service) => service.name === instance.service_entity,
    );

    if (serviceModel) {
      mergedInstances.push(
        shapesDataTransform(instance, embeddedInstances, serviceModel),
      );
    }
  });

  return mergedInstances;
};

const isSingularRelation = (model?: EmbeddedEntity) => {
  return !!model && !!model.upper_limit && model.upper_limit === 1;
};

/**
 * Gets the coordinates of all cells in the graph. https://resources.jointjs.com/docs/jointjs/v4.0/joint.html#dia.Graph
 *
 * @param {dia.Graph} graph - The graph from which to get the cells.
 *
 * @returns {SavedCoordinates[]} An array of objects, each containing the id, name, attributes, and coordinates of a cell.
 */
export const getCellsCoordinates = (graph: dia.Graph): SavedCoordinates[] => {
  const cells = graph.getCells();

  return cells
    .filter((cell) => cell.attributes.type === "app.ServiceEntityBlock")
    .map((cell) => ({
      id: cell.id,
      name: cell.attributes.entityName,
      attributes: cell.attributes.instanceAttributes,
      coordinates: cell.attributes.position,
    }));
};

/**
 * Applies coordinates to cells in the graph. https://resources.jointjs.com/docs/jointjs/v4.0/joint.html#dia.Graph
 *
 * @param {dia.Graph} graph - The graph to which to apply the coordinates.
 * @param {SavedCoordinates[]} coordinates - The coordinates to apply to the cells.
 *
 * @returns {void}
 */
export const applyCoordinatesToCells = (
  graph: dia.Graph,
  coordinates: SavedCoordinates[],
): void => {
  const cells = graph.getCells();

  coordinates.forEach((element) => {
    const correspondingCell = cells.find(
      (cell) =>
        element.id === cell.id ||
        (element.name === cell.attributes.entityName &&
          isEqual(element.attributes, cell.attributes.instanceAttributes)),
    );

    if (correspondingCell) {
      correspondingCell.set("position", {
        x: element.coordinates.x,
        y: element.coordinates.y,
      });
    }
  });
};

/**
 * Updates the instances to send based on the action performed on a cell.
 *
 * @param cell - The cell that the action was performed on.
 * @param action - The action that was performed.
 * @param serviceOrderItems - The current map of instances to send.
 * @returns  {Map<string, ComposerServiceOrderItem>} The updated map of instances to send.
 */
export const updateServiceOrderItems = (
  cell: ServiceEntityBlock,
  action: ActionEnum,
  serviceOrderItems: Map<string, ComposerServiceOrderItem>,
): Map<string, ComposerServiceOrderItem> => {
  const newInstance: ComposerServiceOrderItem = {
    instance_id: cell.id,
    service_entity: cell.getName(),
    config: {},
    action: null,
    attributes: cell.get("sanitizedAttrs"),
    edits: null,
    embeddedTo: cell.get("embeddedTo"),
    relatedTo: cell.getRelations(),
  };
  const copiedInstances = new Map(serviceOrderItems); // copy

  const updatedInstance = serviceOrderItems.get(String(cell.id));

  switch (action) {
    case ActionEnum.UPDATE:
      if (!updatedInstance) {
        throw new Error(words("instanceComposer.error.updateInstanceNotInMap")); //updating instance that doesn't exist in the map shouldn't happen
      }

      //action in the instance isn't the same as action passed to this function, this assertion is to make sure that the update action won't change the action state of newly created instance.
      newInstance.action =
        updatedInstance.action === ActionEnum.CREATE
          ? ActionEnum.CREATE
          : ActionEnum.UPDATE;
      copiedInstances.set(String(cell.id), newInstance);
      break;
    case ActionEnum.CREATE:
      newInstance.action = action;
      copiedInstances.set(String(cell.id), newInstance);
      break;
    default:
      if (
        updatedInstance &&
        (updatedInstance.action === null ||
          updatedInstance.action === ActionEnum.UPDATE)
      ) {
        copiedInstances.set(String(cell.id), {
          instance_id: cell.id,
          service_entity: cell.getName(),
          config: {},
          action: ActionEnum.DELETE,
          attributes: null,
          edits: null,
          embeddedTo: cell.attributes.embeddedTo,
          relatedTo: cell.attributes.relatedTo,
        });
      } else {
        copiedInstances.delete(String(cell.id));
      }

      break;
  }

  return copiedInstances;
};

/**
 * Retrieves the key attribute names from a service model or embedded entity.
 *
 * This function extracts the key attribute names from the provided service model or embedded entity. If the service model has a unique `service_identity` attribute, it is added to the key attributes.
 * Duplicate attributes are removed before returning the final list of key attribute names.
 *
 * @param {ServiceModel | EmbeddedEntity} serviceModel - The service model or embedded entity from which to extract key attribute names.
 * @returns {string[]} An array of key attribute names.
 */
export const getKeyAttributesNames = (
  serviceModel: ServiceModel | EmbeddedEntity,
): string[] => {
  let keyAttributes = serviceModel.key_attributes || [];

  //service_identity is a unique attribute to Service model, but doesn't exist in the Embedded Entity model
  if ("service_identity" in serviceModel && serviceModel.service_identity) {
    keyAttributes.push(serviceModel.service_identity);

    keyAttributes = Array.from(new Set(keyAttributes)); //remove possible duplicates
  }

  return keyAttributes;
};
