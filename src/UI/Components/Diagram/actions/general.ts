import { dia } from "@inmanta/rappid";
import { EmbeddedEntity, InstanceAttributeModel, ServiceModel } from "@/Core";
import { dispatchAddInterServiceRelationToTracker } from "../Context/dispatchers";
import { getKeyAttributesNames } from "../helpers";
import {
  ComposerEntityOptions,
  EntityType,
  InterServiceRelationOnCanvasWithMin,
} from "../interfaces";
import { Link, ServiceEntityBlock } from "../shapes";

/**
 * Function that creates, appends and returns created Entity
 *
 * @param {ServiceModel | EmbeddedEntity} serviceModel that we want to base created entity on
 * @param {boolean} isCore defines whether created entity is main one in given View
 * @param {boolean} isInEditMode defines whether created entity is is representation of existing instance or new one
 * @param {InstanceAttributeModel} [attributes] of the entity
 * @param {boolean} [isEmbeddedEntity] defines whether created entity is embedded
 * @param {string} [holderName] - name of the entity to which it is embedded/connected
 * @param {string | dia.Cell.ID} [embeddedTo] - id of the entity/shape in which this shape is embedded
 * @param {boolean} [isBlockedFromEditing] - boolean value determining if the instance is blocked from editing
 * @param {boolean} [cantBeRemoved] - boolean value determining if the instance can't be removed
 * @param {string} [stencilName] - name of the stencil that should be disabled in the sidebar
 * @param {string} [id] - unique id of the entity, optional
 * @param {boolean} [isFromInventoryStencil] - boolean value determining if the instance is created through inventory stencil
 *
 * @returns {ServiceEntityBlock} created JointJS shape
 */
export function createComposerEntity({
  serviceModel,
  isCore,
  isInEditMode,
  attributes,
  isEmbeddedEntity = false,
  holderName = "",
  embeddedTo,
  isBlockedFromEditing = false,
  cantBeRemoved = false,
  stencilName,
  id,
  isFromInventoryStencil = false,
}: ComposerEntityOptions): ServiceEntityBlock {
  //Create shape for Entity
  const instanceAsTable = new ServiceEntityBlock();

  if (isEmbeddedEntity && "type" in serviceModel) {
    instanceAsTable.setName(serviceModel.name, serviceModel.type);
  } else {
    instanceAsTable.setName(serviceModel.name, null);
  }

  //if there is if provided, we use it, if not we use default one, created by JointJS
  if (id) {
    instanceAsTable.set("id", id);
  }

  if (isEmbeddedEntity) {
    instanceAsTable.setTabColor(EntityType.EMBEDDED);
    instanceAsTable.set("embeddedTo", embeddedTo);
    instanceAsTable.set("isEmbeddedEntity", isEmbeddedEntity);
    instanceAsTable.set("holderName", holderName);
  } else if (isCore) {
    instanceAsTable.set("isCore", isCore);
    instanceAsTable.setTabColor(EntityType.CORE);
  } else {
    instanceAsTable.setTabColor(EntityType.RELATION);
    instanceAsTable.set("stencilName", stencilName);
  }

  instanceAsTable.set("isInEditMode", isInEditMode);
  instanceAsTable.set("serviceModel", serviceModel);
  instanceAsTable.set("isBlockedFromEditing", isBlockedFromEditing);
  instanceAsTable.set("cantBeRemoved", cantBeRemoved);

  if (serviceModel.inter_service_relations.length > 0 && !isFromInventoryStencil) {
    AddInterServiceRelationsToTracker(instanceAsTable, serviceModel);
  }

  if (attributes) {
    const keyAttributes = getKeyAttributesNames(serviceModel);

    updateAttributes(instanceAsTable, keyAttributes, attributes, true);
  }

  return instanceAsTable;
}

/**
 * Function that iterate through inter-service relations and adds their constraints to the tracker
 * @param {ServiceEntityBlock} instanceAsTable - JointJS shape object
 * @param {ServiceModel | EmbeddedEntity} serviceModel - ServiceModel or EmbeddedEntity object
 * @returns {void}
 */
export const AddInterServiceRelationsToTracker = (
  instanceAsTable: ServiceEntityBlock,
  serviceModel: ServiceModel | EmbeddedEntity
) => {
  instanceAsTable.set("relatedTo", new Map());
  const relations: InterServiceRelationOnCanvasWithMin[] = [];
console.log(serviceModel.inter_service_relations)
  serviceModel.inter_service_relations.forEach((relation) => {
    if (1 > 0) {
      relations.push({
        name: relation.entity_type,
        min: 1,
        currentAmount: 0,
      });
    }
  });

  dispatchAddInterServiceRelationToTracker(instanceAsTable.id, serviceModel.name, relations);
};

/**
 * Function that create connection/link between two Entities
 * @param {dia.Graph} graph JointJS graph object
 * @param {ServiceEntityBlock} source JointJS shape object
 * @param {ServiceEntityBlock} target JointJS shape object
 * @param {boolean} isBlocked parameter determining whether we are showing tools for linkView
 * @returns {void}
 */
export const connectEntities = (
  graph: dia.Graph,
  source: ServiceEntityBlock,
  targets: ServiceEntityBlock[],
  isBlocked?: boolean
): void => {
  targets.map((target) => {
    const link = new Link();

    if (isBlocked) {
      link.set("isBlockedFromEditing", isBlocked);
    }

    link.source(source);
    link.target(target);
    graph.addCell(link);
    graph.trigger("link:connect", link);
  });
};

/**
 *  Function that iterates through service instance attributes for values and appends in jointJS entity for display
 *
 * @param {ServiceEntityBlock} serviceEntity - shape of the entity to which columns will be appended
 * @param {string[]} keyAttributes - names of the attributes that we iterate for the values
 * @param {InstanceAttributeModel} serviceInstanceAttributes - attributes of given instance/entity
 * @param {boolean=true} isInitial - boolean indicating whether should we updateAttributes or edit - default = true
 * @returns {void}
 */
export const updateAttributes = (
  serviceEntity: ServiceEntityBlock,
  keyAttributes: string[],
  serviceInstanceAttributes: InstanceAttributeModel,
  isInitial = true
): void => {
  const attributesToDisplay = keyAttributes.map((key) => {
    const value = serviceInstanceAttributes ? (serviceInstanceAttributes[key] as string) : "";

    return {
      name: key,
      value: value || "",
    };
  });

  if (isInitial) {
    serviceEntity.appendColumns(attributesToDisplay);
  } else {
    serviceEntity.updateColumns(attributesToDisplay, serviceEntity.attributes.isCollapsed);
  }

  serviceEntity.set("instanceAttributes", serviceInstanceAttributes);

  if (isInitial && !serviceEntity.get("sanitizedAttrs")) {
    //for initial appending instanceAttributes are equal sanitized ones
    serviceEntity.set("sanitizedAttrs", serviceInstanceAttributes);
  }
};
