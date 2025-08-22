import { dia } from "@inmanta/rappid";
import { DirectedGraph } from "@joint/layout-directed-graph";
import { EmbeddedEntity, InstanceAttributeModel, ServiceInstanceModel, ServiceModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Queries";
import { words } from "@/UI/words";
import { dispatchUpdateStencil } from "../Context/dispatchers";
import { findCorrespondingId, findFullInterServiceRelations, getEntityAttributes } from "../helpers";
import activeImage from "../icons/active-icon.svg";
import candidateImage from "../icons/candidate-icon.svg";
import { EventActionEnum, relationId } from "../interfaces";
import { ServiceEntityBlock } from "../shapes";
import { toggleDisabledStencil } from "../stencil/helpers";
import { connectEntities, createComposerEntity } from "./general";

export interface AppendInstanceParams {
  paper: dia.Paper;
  graph: dia.Graph;
  instanceWithRelations: InstanceWithRelations;
  services: ServiceModel[];
  isMainInstance?: boolean;
  isBlockedFromEditing?: boolean;
}

/**
 * This function converts Instance attributes to display them on the Smart Service Composer canvas.
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.Graph
 *
 * @param {AppendInstanceParams} params - The parameters for appending the instance.
 * @param {dia.Paper} params.paper - JointJS paper object
 * @param {dia.Graph} params.graph - JointJS graph object
 * @param {InstanceWithRelations} params.instanceWithRelations - that we want to display
 * @param {ServiceModel[]} params.services - that hold definitions for attributes which we want to display as instance Object doesn't differentiate core attributes from i.e. embedded entities
 * @param {boolean} params.isMainInstance - boolean value determining if the instance is the core one. Defaults to true.
 * @param {boolean} params.isBlockedFromEditing - boolean value determining if the instance is blocked from editing. Defaults to false.
 *
 * @returns {ServiceEntityBlock[]} appendedInstance to allow connect related by inter-service relations Instances added concurrently
 */
export function appendInstance({
  paper,
  graph,
  instanceWithRelations,
  services,
  isMainInstance = true,
  isBlockedFromEditing = false,
}: AppendInstanceParams): ServiceEntityBlock[] {
  const serviceInstance = instanceWithRelations.instance;
  const serviceInstanceModel = services.find(
    (model) => model.name === serviceInstance.service_entity
  );

  if (!serviceInstanceModel) {
    throw Error(words("instanceComposer.errorMessage.missingModel"));
  }

  const attributes =
    serviceInstance.candidate_attributes || serviceInstance.active_attributes || undefined;

  const stencilName = serviceInstance.service_identity_attribute_value
    ? serviceInstance.service_identity_attribute_value
    : serviceInstance.id;

  const instanceAsTable = createComposerEntity({
    serviceModel: serviceInstanceModel,
    isCore: isMainInstance,
    isInEditMode: true,
    attributes,
    cantBeRemoved: isMainInstance && !serviceInstanceModel.strict_modifier_enforcement,
    isBlockedFromEditing: !serviceInstanceModel.strict_modifier_enforcement || isBlockedFromEditing,
    stencilName: !isMainInstance ? stencilName : undefined,
    id: instanceWithRelations.instance.id,
  });

  instanceAsTable.addTo(graph);

  // Disable the corresponding stencil item in the inventory sidebar
  if (stencilName) {
    toggleDisabledStencil(stencilName, true);
  }

  let embeddedEntities: ServiceEntityBlock[] = addEmbeddedEntities({
    graph,
    paper,
    instanceAsTable,
    serviceModel: serviceInstanceModel,
    instance: serviceInstance,
    isBlockedFromEditing,
  });

  // Map through inter-service related instances and either append them and connect to them or connect to already existing ones
  instanceWithRelations.interServiceRelations.forEach((interServiceRelation) => {
    const cellAdded = graph.getCell(interServiceRelation.id);

    // If cell isn't in the graph, we need to append it and connect it to the one we are currently working on
    if (!cellAdded) {
      const appendedInstances = appendInstance({
        paper,
        graph,
        instanceWithRelations: { instance: interServiceRelation, interServiceRelations: [] },
        services,
        isMainInstance: false,
        isBlockedFromEditing: true,
      });

      toggleDisabledStencil(appendedInstances[0].get("stencilName"), true);
    } else {
      // If cell is already in the graph, we need to check if it got in its inter-service relations the one with id that corresponds with created instanceAsTable
      let isConnected = false;
      const cellAsBlock = cellAdded as ServiceEntityBlock;
      const relations = cellAsBlock.getRelations();

      if (relations) {
        const correspondingId = findCorrespondingId(relations, instanceAsTable);

        if (correspondingId) {
          isConnected = true;
          connectEntities(
            graph,
            instanceAsTable,
            [cellAsBlock],
            serviceInstanceModel.strict_modifier_enforcement
          );
        }
      }

      // If doesn't, or the one we are looking for isn't among the ones stored, 
      // we need go through every connected shape and do the same assertion,
      // as the fact that we have that cell as interServiceRelation tells us that either that or its embedded entities has connection
      if (!isConnected) {
        const neighbors = graph.getNeighbors(cellAdded as dia.Element);

        neighbors.map((cell) => {
          const neighborRelations = (cell as ServiceEntityBlock).getRelations();

          if (neighborRelations) {
            const correspondingId = findCorrespondingId(neighborRelations, instanceAsTable);

            if (correspondingId) {
              isConnected = true;
              connectEntities(
                graph,
                instanceAsTable,
                [cell as ServiceEntityBlock],
                serviceInstanceModel.strict_modifier_enforcement
              );
            }
          }
        });
      }

      connectEntities(
        graph,
        instanceAsTable,
        [cellAsBlock],
        serviceInstanceModel.strict_modifier_enforcement
      );
    }
  });

  connectAppendedEntities([instanceAsTable, ...embeddedEntities], graph);

  // auto-layout provided by JointJS
  DirectedGraph.layout(graph, {
    nodeSep: 80,
    edgeSep: 80,
    rankDir: "BT",
  });

  return [...embeddedEntities, instanceAsTable];
}

export interface AddEmbeddedEntitiesParams {
  graph: dia.Graph;
  paper: dia.Paper;
  instanceAsTable: ServiceEntityBlock;
  serviceModel: ServiceModel;
  instance: ServiceInstanceModel;
  isBlockedFromEditing?: boolean;
}

/**
 * Function that appends attributes into the entity and creates nested embedded entities that connects to given instance/entity
 *
 * @param {AddEmbeddedEntitiesParams} params - The parameters for adding embedded entities.
 * @param {dia.Graph} params.graph - JointJS graph object
 * @param {dia.Paper} params.paper - JointJS paper object
 * @param {ServiceEntityBlock} params.instanceAsTable - created Entity
 * @param {ServiceModel} params.serviceModel - serviceModel model of given instance/entity
 * @param {InstanceAttributeModel} params.attributesValues - attributes of given instance/entity
 * @param {"candidate" | "active"} params.presentedAttr - identify used set of attributes if they are taken from Service Instance
 * @param {boolean} params.isBlockedFromEditing - boolean value determining if the instance is blocked from editing. Defaults to false.
 *
 * @returns {ServiceEntityBlock[]} - returns array of created embedded entities, that are connected to given entity
 */
function addEmbeddedEntities({
  graph,
  paper,
  instanceAsTable,
  serviceModel,
  instance,
  isBlockedFromEditing = false,
}: AddEmbeddedEntitiesParams): ServiceEntityBlock[] {
  const { embedded_entities } = serviceModel;
  const attributes = instance.candidate_attributes || instance.active_attributes || undefined;

  if (!attributes) {
    return [];
  }

  const presentedAttr = instance.candidate_attributes ? "candidate" : "active";


  // Iterate through embedded entities to create and connect them
  // We are basing iteration on service Model, if there is no value in the instance and if the value has modifier set to "r", 
  // skip that entity - "r" entities are read-only, 
  // they can't be edited and can be in multiple places which would result with enormous tree of cells in the graph 
  // and the canvas which would discourage user from using the Instance Composer
  const createdEmbedded = embedded_entities
    .filter((entity) => !!attributes[entity.name] && entity.modifier !== "r")
    .flatMap((entity) => {
      const entityAttributes = getEntityAttributes(entity.name, attributes);

      if (!entityAttributes) {
        return [];
      }

      const appendedEntities = appendEmbeddedEntity({
        paper,
        graph,
        embeddedEntity: entity,
        entityAttributes,
        embeddedTo: instanceAsTable.id,
        holderName: serviceModel.name,
        presentedAttr,
        isBlockedFromEditing: !serviceModel.strict_modifier_enforcement || isBlockedFromEditing,
      });

      connectEntities(
        graph,
        instanceAsTable,
        appendedEntities,
        !serviceModel.strict_modifier_enforcement
      );

      return appendedEntities;
    });

  const relations = serviceModel.inter_service_relations || [];

  relations.forEach((relation) => {
    const relationId = attributes[relation.name];

    if (relationId) {
      if (Array.isArray(relationId)) {
        relationId.forEach((id) => {
          instanceAsTable.addRelation(id, relation.name);
        });
      } else {
        instanceAsTable.addRelation(relationId as string, relation.name);
      }
    }
  });

  addInfoIcon(instanceAsTable, presentedAttr);

  return createdEmbedded;
}

export interface AppendEmbeddedEntityParams {
  paper: dia.Paper;
  graph: dia.Graph;
  embeddedEntity: EmbeddedEntity;
  entityAttributes: InstanceAttributeModel | InstanceAttributeModel[];
  embeddedTo: string | dia.Cell.ID;
  holderName: string;
  presentedAttr?: "candidate" | "active";
  isBlockedFromEditing?: boolean;
}

/**
 * Function that creates, appends and returns created embedded entities which then are used to connects to it's parent
 * Supports recursion to display the whole tree
 *
 * @param {AppendEmbeddedEntityParams} params - The parameters for appending the embedded entity.
 * @param {dia.Paper} params.paper - JointJS paper object
 * @param {dia.Graph} params.graph - JointJS graph object
 * @param {EmbeddedEntity} params.embeddedEntity - that we want to display
 * @param {InstanceAttributeModel | InstanceAttributeModel[]} params.entityAttributes - attributes of given entity
 * @param {string | dia.Cell.ID} params.embeddedTo - id of the entity/shape in which this shape is embedded
 * @param {string} params.holderName - name of the entity to which it is embedded/connected
 * @param {"candidate" | "active"} params.presentedAttr - flag whether we are displaying candidate or active attributes
 * @param {boolean} params.isBlockedFromEditing - boolean value determining if the instance is blocked from editing
 *
 * @returns {ServiceEntityBlock[]} created JointJS shapes
 */
export function appendEmbeddedEntity({
  paper,
  graph,
  embeddedEntity,
  entityAttributes,
  embeddedTo,
  holderName,
  presentedAttr,
  isBlockedFromEditing,
}: AppendEmbeddedEntityParams): ServiceEntityBlock[] {
  //Create shape for Entity

  /**
   *  Create single Embedded Entity, and handle setting all of the essential data and append it and it's eventual children to the graph.
   * Then connect it with it's eventual children and other entities that have inter-service relation to this Entity
   *
   * @param {InstanceAttributeModel} entityInstance instance of entity Attributes
   * @returns {ServiceEntityBlock} appended embedded entity to the graph
   */
  function appendSingleEntity(entityInstance: InstanceAttributeModel): ServiceEntityBlock {
    //Create shape for Entity
    const instanceAsTable = createComposerEntity({
      serviceModel: embeddedEntity,
      isCore: false,
      isInEditMode: true,
      attributes: entityInstance,
      isEmbeddedEntity: true,
      holderName,
      embeddedTo,
      isBlockedFromEditing,
      cantBeRemoved: embeddedEntity.modifier !== "rw+",
    });

    if (presentedAttr) {
      addInfoIcon(instanceAsTable, presentedAttr);
    }

    dispatchUpdateStencil(embeddedEntity.name, EventActionEnum.ADD);

    //add to graph
    instanceAsTable.addTo(graph);

    //iterate through embedded entities to create and connect them
    embeddedEntity.embedded_entities
      .filter((entity) => entity.modifier !== "r") // filter out read-only embedded entities to de-clutter the view as they can't be edited and can be in multiple places which would result with enormous tree of cells in the graph and the canvas
      .forEach((entity) => {
        const appendedEntity = appendEmbeddedEntity({
          paper,
          graph,
          embeddedEntity: entity,
          entityAttributes: entityInstance[entity.name] as InstanceAttributeModel,
          embeddedTo: instanceAsTable.id as string,
          holderName: embeddedEntity.name,
          presentedAttr,
          isBlockedFromEditing,
        });

        connectEntities(graph, instanceAsTable, appendedEntity, isBlockedFromEditing);
      });

    const relations = embeddedEntity.inter_service_relations || [];

    relations.map((relation) => {
      const relationId = entityInstance[relation.name] as relationId;

      if (relationId) {
        instanceAsTable.addRelation(relationId, relation.name);
      }
    });

    return instanceAsTable;
  }

  if (Array.isArray(entityAttributes)) {
    return entityAttributes.map((entity) => appendSingleEntity(entity));
  } else {
    return [appendSingleEntity(entityAttributes)];
  }
}

/**
 * Adds icon to the Entity with tooltip that tells on which set of attributes given shape is created
 * @param {ServiceEntityBlock} instanceAsTable created Entity
 * @param {"candidate" | "active"=} presentedAttrs *optional* indentify used set of attributes if they are taken from Service Instance
 * @returns {void}
 */
export function addInfoIcon(
  instanceAsTable: ServiceEntityBlock,
  presentedAttrs: "candidate" | "active"
): void {
  const infoAttrs = {
    preserveAspectRatio: "none",
    cursor: "pointer",
    x: "calc(0.85*w)",
  };

  if (presentedAttrs === "candidate") {
    instanceAsTable.attr({
      info: {
        ...infoAttrs,
        "xlink:href": candidateImage,
        "data-tooltip": words("attributes.candidate"),
        y: 6,
        width: 15,
        height: 15,
      },
    });
  } else {
    instanceAsTable.attr({
      info: {
        ...infoAttrs,
        "xlink:href": activeImage,
        "data-tooltip": words("attributes.active"),
        y: 8,
        width: 14,
        height: 14,
      },
    });
  }
}

/**
 * Connects the appended entities to the entities they are related to.
 * This function look for Map of relations in the appended entities and connects them through the id
 *
 * @param {ServiceEntityBlock[]} appendedInstances - The appended entities to connect.
 * @param {dia.Graph} graph - The graph to which the entities are appended.
 * @returns {void}
 */
const connectAppendedEntities = (
  appendedEntities: ServiceEntityBlock[],
  graph: dia.Graph
): void => {
  appendedEntities.forEach((cell) => {
    const relationMap = cell.get("relatedTo") as Map<string, string>;
    const model = cell.get("serviceModel") as ServiceModel;
    const relations = findFullInterServiceRelations(model);

    //if there is relationMap, we iterate through them, and search for cell with corresponding id
    if (relationMap) {
      relationMap.forEach((_value, key) => {
        const relatedCell = graph.getCell(key) as ServiceEntityBlock;

        //if we find the cell, we check if it has relation with the cell we are currently working on
        if (relatedCell) {
          const relation = relations.find(
            (relation) => relation.entity_type === relatedCell.getName()
          );

          //if it has, we connect them
          if (relation) {
            relatedCell.set("cantBeRemoved", relation.modifier !== "rw+");
            connectEntities(graph, relatedCell, [cell], relation.modifier !== "rw+");
          }
        }
      });
    }
  });
};
