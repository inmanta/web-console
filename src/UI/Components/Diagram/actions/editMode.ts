import { dia } from "@inmanta/rappid";
import { DirectedGraph } from "@joint/layout-directed-graph";
import { EmbeddedEntity, InstanceAttributeModel, ServiceModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Managers/V2/ServiceInstance";
import { words } from "@/UI/words";
import { dispatchUpdateStencil } from "../Context/dispatchers";
import { findCorrespondingId, findFullInterServiceRelations } from "../helpers";
import activeImage from "../icons/active-icon.svg";
import candidateImage from "../icons/candidate-icon.svg";
import { EventActionEnum, relationId } from "../interfaces";
import { ServiceEntityBlock } from "../shapes";
import { toggleDisabledStencil } from "../stencil/helpers";
import { connectEntities, createComposerEntity } from "./general";

/**
 * This function converts Instance attributes to display them on the Smart Service Composer canvas.
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.Graph
 *
 * @param {dia.Graph} graph JointJS graph object
 * @param {dia.Paper} paper JointJS paper object
 * @param {InstanceWithRelations} instanceWithRelations that we want to display
 * @param {ServiceModel[]} services that hold definitions for attributes which we want to display as instance Object doesn't differentiate core attributes from i.e. embedded entities
 * @param {boolean} isMainInstance boolean value determining if the instance is the core one
 * @param {boolean} isBlockedFromEditing boolean value determining if the instance is blocked from editing
 *
 * @returns {ServiceEntityBlock} appendedInstance to allow connect related by inter-service relations Instances added concurrently
 */
export function appendInstance(
  paper: dia.Paper,
  graph: dia.Graph,
  instanceWithRelations: InstanceWithRelations,
  services: ServiceModel[],
  isMainInstance = true,
  isBlockedFromEditing = false
): ServiceEntityBlock[] {
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

  let embeddedEntities: ServiceEntityBlock[] = [];

  //check for any presentable attributes, where candidate attrs have priority, if there is a set, then append them to  JointJS shape and try to display and connect embedded entities
  if (serviceInstance.candidate_attributes) {
    embeddedEntities = addEmbeddedEntities(
      graph,
      paper,
      instanceAsTable,
      serviceInstanceModel,
      serviceInstance.candidate_attributes,
      "candidate",
      isBlockedFromEditing
    );
    addInfoIcon(instanceAsTable, "candidate");
  } else if (serviceInstance.active_attributes) {
    embeddedEntities = addEmbeddedEntities(
      graph,
      paper,
      instanceAsTable,
      serviceInstanceModel,
      serviceInstance.active_attributes,
      "active",
      isBlockedFromEditing
    );
    addInfoIcon(instanceAsTable, "active");
  }

  //map through inter-service related instances and either append them and connect to them or connect to already existing ones
  instanceWithRelations.interServiceRelations.forEach((interServiceRelation) => {
    const cellAdded = graph.getCell(interServiceRelation.id);
    const isBlockedFromEditing = true;

    //If cell isn't in the graph, we need to append it and connect it to the one we are currently working on
    if (!cellAdded) {
      const isMainInstance = false;
      const appendedInstances = appendInstance(
        paper,
        graph,
        { instance: interServiceRelation, interServiceRelations: [] },
        services,
        isMainInstance,
        isBlockedFromEditing
      );

      toggleDisabledStencil(appendedInstances[0].get("stencilName"), true);
    } else {
      //If cell is already in the graph, we need to check if it got in its inter-service relations the one with id that corresponds with created instanceAsTable
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

      //If doesn't, or the one we are looking for isn't among the ones stored, we need go through every connected shape and do the same assertion,
      //as the fact that we have that cell as interServiceRelation tells us that either that or its embedded entities has connection
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

/**
 * Function that appends attributes into the entity and creates nested embedded entities that connects to given instance/entity
 *
 * @param {dia.Graph} graph JointJS graph object
 * @param {dia.Paper} paper JointJS paper object
 * @param {ServiceEntityBlock} instanceAsTable created Entity
 * @param {ServiceModel} serviceModel - serviceModel model of given instance/entity
 * @param {InstanceAttributeModel} attributesValues - attributes of given instance/entity
 * @param {"candidate" | "active"} presentedAttrs *optional* identify used set of attributes if they are taken from Service Instance
 * @param {ServiceEntityBlock=} instanceToConnectRelation *optional* shape to which eventually should embedded entity or  be connected to
 *
 * @returns {ServiceEntityBlock[]} - returns array of created embedded entities, that are connected to given entity
 */
function addEmbeddedEntities(
  graph: dia.Graph,
  paper: dia.Paper,
  instanceAsTable: ServiceEntityBlock,
  serviceModel: ServiceModel,
  attributesValues: InstanceAttributeModel,
  presentedAttr: "candidate" | "active",
  isBlockedFromEditing = false
): ServiceEntityBlock[] {
  const { embedded_entities } = serviceModel;
  //iterate through embedded entities to create and connect them
  //we are basing iteration on service Model, if there is no value in the instance and if the value has modifier set to "r", skip that entity - "r" entities are read-only, they can't be edited and can be in multiple places which would result with enormous tree of cells in the graph and the canvas which would discourage user from using the Instance Composer
  const createdEmbedded = embedded_entities
    .filter((entity) => !!attributesValues[entity.name] && entity.modifier !== "r")
    .flatMap((entity) => {
      const appendedEntities = appendEmbeddedEntity(
        paper,
        graph,
        entity,
        attributesValues[entity.name] as InstanceAttributeModel,
        instanceAsTable.id,
        serviceModel.name,
        presentedAttr,
        !serviceModel.strict_modifier_enforcement || isBlockedFromEditing
      );

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
    const relationId = attributesValues[relation.name];

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

  return createdEmbedded;
}

/**
 * Function that creates, appends and returns created embedded entities which then are used to connects to it's parent
 * Supports recursion to display the whole tree
 *
 * @param {dia.Graph} graph JointJS graph object
 * @param {dia.Paper} paper JointJS paper object
 * @param {EmbeddedEntity} embeddedEntity that we want to display
 * @param {InstanceAttributeModel} entityAttributes - attributes of given entity
 * @param {string | null} embeddedTo - id of the entity/shape in which this shape is embedded
 * @param {string} holderName - name of the entity to which it is embedded/connected
 * @param {"candidate" | "active"} ConnectionRules - flag whether we are displaying candidate or active attributes
 * @param {boolean} isBlockedFromEditing boolean value determining if the instance is blocked from editin
 *
 * @returns {ServiceEntityBlock[]} created JointJS shapes
 */
export function appendEmbeddedEntity(
  paper: dia.Paper,
  graph: dia.Graph,
  embeddedEntity: EmbeddedEntity,
  entityAttributes: InstanceAttributeModel | InstanceAttributeModel[],
  embeddedTo: string | dia.Cell.ID,
  holderName: string,
  presentedAttr?: "candidate" | "active",
  isBlockedFromEditing?: boolean
): ServiceEntityBlock[] {
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
        const appendedEntity = appendEmbeddedEntity(
          paper,
          graph,
          entity,
          entityInstance[entity.name] as InstanceAttributeModel,
          instanceAsTable.id as string,
          embeddedEntity.name,
          presentedAttr,
          isBlockedFromEditing
        );

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
