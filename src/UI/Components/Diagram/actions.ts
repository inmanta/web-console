import { dia } from "@inmanta/rappid";
import { DirectedGraph } from "@joint/layout-directed-graph";
import { EmbeddedEntity, InstanceAttributeModel, ServiceModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Managers/V2/GETTERS/GetInstanceWithRelations";
import { words } from "@/UI/words";
import {
  CreateModifierHandler,
  FieldCreator,
  createFormState,
} from "../ServiceInstanceForm";
import {
  findCorrespondingId,
  findFullInterServiceRelations,
  getKeyAttributesNames,
} from "./helpers";
import activeImage from "./icons/active-icon.svg";
import candidateImage from "./icons/candidate-icon.svg";
import {
  ComposerEntityOptions,
  EmbeddedEventEnum,
  EntityType,
  relationId,
} from "./interfaces";
import { Link, ServiceEntityBlock } from "./shapes";

/**
 * Function that creates, appends and returns created Entity
 *
 * @param {ServiceModel | EmbeddedEntity} serviceModel that we want to base created entity on
 * @param {boolean} isCore defines whether created entity is main one in given View
 * @param {boolean} isInEditMode defines whether created entity is is representation of existing instance or new one
 * @param {InstanceAttributeModel} [attributes] of the entity
 * @param {boolean} [isEmbedded] defines whether created entity is embedded
 * @param {string} [holderName] - name of the entity to which it is embedded/connected
 * @param {string | dia.Cell.ID} [embeddedTo] - id of the entity/shape in which this shape is embedded
 * @param {boolean} [isBlockedFromEditing] - boolean value determining if the instance is blocked from editing
 * @param {boolean} [cantBeRemoved] - boolean value determining if the instance can't be removed
 * @param {string} [stencilName] - name of the stencil that should be disabled in the sidebar
 * @param {string} [id] - unique id of the entity, optional
 *
 * @returns {ServiceEntityBlock} created JointJS shape
 */
export function createComposerEntity({
  serviceModel,
  isCore,
  isInEditMode,
  attributes,
  isEmbedded = false,
  holderName = "",
  embeddedTo,
  isBlockedFromEditing = false,
  cantBeRemoved = false,
  stencilName,
  id,
}: ComposerEntityOptions): ServiceEntityBlock {
  //Create shape for Entity
  const instanceAsTable = new ServiceEntityBlock();

  instanceAsTable.setName(serviceModel.name);

  //if there is if provided, we use it, if not we use default one, created by JointJS
  if (id) {
    instanceAsTable.set("id", id);
  }

  if (isEmbedded) {
    instanceAsTable.setTabColor(EntityType.EMBEDDED);
    instanceAsTable.set("embeddedTo", embeddedTo);
    instanceAsTable.set("isEmbedded", isEmbedded);
    instanceAsTable.set("holderName", holderName);
    // If the instance is not core, we need to apply its stencil name to the shape to later disable its corresponding stencil in the sidebar
    instanceAsTable.set("stencilName", stencilName);
  } else if (isCore) {
    instanceAsTable.set("isCore", isCore);
    instanceAsTable.setTabColor(EntityType.CORE);
  } else {
    instanceAsTable.setTabColor(EntityType.RELATION);
  }

  instanceAsTable.set("isInEditMode", isInEditMode);
  instanceAsTable.set("serviceModel", serviceModel);
  instanceAsTable.set("isBlockedFromEditing", isBlockedFromEditing);
  instanceAsTable.set("cantBeRemoved", cantBeRemoved);

  if (
    serviceModel.inter_service_relations &&
    serviceModel.inter_service_relations.length > 0
  ) {
    instanceAsTable.set("relatedTo", new Map());
  }

  if (attributes) {
    const keyAttributes = getKeyAttributesNames(serviceModel);

    updateAttributes(instanceAsTable, keyAttributes, attributes, true);
  }

  return instanceAsTable;
}

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
  isBlockedFromEditing = false,
): ServiceEntityBlock[] {
  const serviceInstance = instanceWithRelations.instance;
  const serviceInstanceModel = services.find(
    (model) => model.name === serviceInstance.service_entity,
  );

  if (!serviceInstanceModel) {
    throw Error(words("instanceComposer.errorMessage.missingModel"));
  }

  const attributes =
    serviceInstance.candidate_attributes ||
    serviceInstance.active_attributes ||
    undefined;

  const stencilName = serviceInstance.service_identity_attribute_value
    ? serviceInstance.service_identity_attribute_value
    : serviceInstance.id;

  const instanceAsTable = createComposerEntity({
    serviceModel: serviceInstanceModel,
    isCore: isMainInstance,
    isInEditMode: true,
    attributes,
    cantBeRemoved:
      isMainInstance && !serviceInstanceModel.strict_modifier_enforcement,
    isBlockedFromEditing:
      !serviceInstanceModel.strict_modifier_enforcement || isBlockedFromEditing,
    stencilName: isMainInstance ? stencilName : undefined,
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
      isBlockedFromEditing,
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
      isBlockedFromEditing,
    );
    addInfoIcon(instanceAsTable, "active");
  }

  //map through inter-service related instances and either append them and connect to them or connect to already existing ones
  instanceWithRelations.interServiceRelations.forEach(
    (interServiceRelation) => {
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
          isBlockedFromEditing,
        );

        //disable Inventory Stencil for inter-service relation instance
        const elements = [
          {
            selector: `.body_${appendedInstances[0].get("stencilName")}`,
            className: "stencil_accent-disabled",
          },
          {
            selector: `.bodyTwo_${appendedInstances[0].get("stencilName")}`,
            className: "stencil_body-disabled",
          },
          {
            selector: `.text_${appendedInstances[0].get("stencilName")}`,
            className: "stencil_text-disabled",
          },
        ];

        elements.forEach(({ selector, className }) => {
          const element = document.querySelector(selector);

          if (element) {
            element.classList.add(className);
          }
        });
      } else {
        //If cell is already in the graph, we need to check if it got in its inter-service relations the one with id that corresponds with created instanceAsTable
        let isConnected = false;
        const cellAsBlock = cellAdded as ServiceEntityBlock;
        const relations = cellAsBlock.getRelations();

        if (relations) {
          const correspondingId = findCorrespondingId(
            relations,
            instanceAsTable,
          );

          if (correspondingId) {
            isConnected = true;
            connectEntities(
              graph,
              instanceAsTable,
              [cellAsBlock],
              serviceInstanceModel.strict_modifier_enforcement,
            );
          }
        }
        //If doesn't, or the one we are looking for isn't among the ones stored, we need go through every connected shape and do the same assertion,
        //as the fact that we have that cell as interServiceRelation tells us that either that or its embedded entities has connection
        if (!isConnected) {
          const neighbors = graph.getNeighbors(cellAdded as dia.Element);

          neighbors.map((cell) => {
            const neighborRelations = (
              cell as ServiceEntityBlock
            ).getRelations();

            if (neighborRelations) {
              const correspondingId = findCorrespondingId(
                neighborRelations,
                instanceAsTable,
              );

              if (correspondingId) {
                isConnected = true;
                connectEntities(
                  graph,
                  instanceAsTable,
                  [cell as ServiceEntityBlock],
                  serviceInstanceModel.strict_modifier_enforcement,
                );
              }
            }
          });
        }
        connectEntities(
          graph,
          instanceAsTable,
          [cellAsBlock],
          serviceInstanceModel.strict_modifier_enforcement,
        );
      }
    },
  );

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
  isBlockedFromEditing?: boolean,
): ServiceEntityBlock[] {
  //Create shape for Entity

  /**
   *  Create single Embedded Entity, and handle setting all of the essential data and append it and it's eventual children to the graph.
   * Then connect it with it's eventual children and other entities that have inter-service relation to this Entity
   *
   * @param {InstanceAttributeModel} entityInstance instance of entity Attributes
   * @returns {ServiceEntityBlock} appended embedded entity to the graph
   */
  function appendSingleEntity(
    entityInstance: InstanceAttributeModel,
  ): ServiceEntityBlock {
    //Create shape for Entity
    const instanceAsTable = createComposerEntity({
      serviceModel: embeddedEntity,
      isCore: false,
      isInEditMode: isBlockedFromEditing || false,
      attributes: entityInstance,
      isEmbedded: true,
      holderName,
      embeddedTo,
      isBlockedFromEditing,
      cantBeRemoved: embeddedEntity.modifier !== "rw+",
    });

    if (presentedAttr) {
      addInfoIcon(instanceAsTable, presentedAttr);
    }

    document.dispatchEvent(
      new CustomEvent("updateStencil", {
        detail: {
          name: embeddedEntity.name,
          action: EmbeddedEventEnum.ADD,
        },
      }),
    );

    //add to graph
    instanceAsTable.addTo(graph);

    //iterate through embedded entities to create and connect them
    embeddedEntity.embedded_entities.forEach((entity) => {
      const appendedEntity = appendEmbeddedEntity(
        paper,
        graph,
        entity,
        entityInstance[entity.name] as InstanceAttributeModel,
        instanceAsTable.id as string,
        embeddedEntity.name,
        presentedAttr,
        isBlockedFromEditing,
      );

      connectEntities(
        graph,
        instanceAsTable,
        appendedEntity,
        isBlockedFromEditing,
      );
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
 * Populates a graph with default required entities derived from a service model.
 *
 * @param {dia.Graph} graph - The jointJS graph to populate.
 * @param {ServiceModel} serviceModel - The service model to use for populating the graph.
 * @returns {void}
 */
export function populateGraphWithDefault(
  graph: dia.Graph,
  serviceModel: ServiceModel,
): void {
  //the most reliable way to get attributes default state is to use Field Creator

  const fieldCreator = new FieldCreator(new CreateModifierHandler());
  const fields = fieldCreator.attributesToFields(serviceModel.attributes);

  const coreEntity = createComposerEntity({
    serviceModel,
    isCore: true,
    isInEditMode: false,
    attributes: createFormState(fields),
  });

  coreEntity.addTo(graph);

  const defaultEntities = addDefaultEntities(graph, serviceModel);

  defaultEntities.forEach((entity) => {
    entity.set("embeddedTo", coreEntity.id);
  });
  connectEntities(graph, coreEntity, defaultEntities);

  DirectedGraph.layout(graph, {
    nodeSep: 80,
    edgeSep: 80,
    rankDir: "BT",
  });
}

/**
 * Adds default entities to a graph based on a service model or an embedded entity.
 *
 * @param {dia.Graph} graph - The jointJS graph to which entities should be added.
 * @param {ServiceModel | EmbeddedEntity} service - The service model or embedded entity used to generate the default entities.
 * @returns {ServiceEntityBlock[]} An array of service entity blocks that have been added to the graph.
 */
export function addDefaultEntities(
  graph: dia.Graph,
  service: ServiceModel | EmbeddedEntity,
): ServiceEntityBlock[] {
  const embedded_entities = service.embedded_entities
    .filter((embedded_entity) => embedded_entity.lower_limit > 0)
    .map((embedded_entity) => {
      const fieldCreator = new FieldCreator(new CreateModifierHandler());
      const fields = fieldCreator.attributesToFields(
        embedded_entity.attributes,
      );

      const embeddedEntity = createComposerEntity({
        serviceModel: embedded_entity,
        isCore: false,
        isInEditMode: false,
        attributes: createFormState(fields),
        isEmbedded: true,
        holderName: service.name,
      });

      document.dispatchEvent(
        new CustomEvent("updateStencil", {
          detail: {
            name: embedded_entity.name,
            action: EmbeddedEventEnum.ADD,
          },
        }),
      );

      embeddedEntity.addTo(graph);
      const subEmbeddedEntities = addDefaultEntities(graph, embedded_entity);

      subEmbeddedEntities.forEach((entity) => {
        entity.set("embeddedTo", embeddedEntity.id);
      });
      connectEntities(graph, embeddedEntity, subEmbeddedEntities);

      return embeddedEntity;
    });

  return embedded_entities;
}

/**
 *  Function that iterates through service instance attributes for values and appends in jointJS entity for display
 *
 * @param {ServiceEntityBlock} serviceEntity - shape of the entity to which columns will be appended
 * @param {string[]} keyAttributes - names of the attributes that we iterate for the values
 * @param {InstanceAttributeModel} serviceInstanceAttributes - attributes of given instance/entity
 * @param {boolean=true} isInitial - boolean indicating whether should we updateAttributes or edit - default = true
 * @returns {void}
 */
export function updateAttributes(
  serviceEntity: ServiceEntityBlock,
  keyAttributes: string[],
  serviceInstanceAttributes: InstanceAttributeModel,
  isInitial = true,
) {
  const attributesToDisplay = keyAttributes.map((key) => {
    const value = serviceInstanceAttributes
      ? (serviceInstanceAttributes[key] as string)
      : "";

    return {
      name: key,
      value: value || "",
    };
  });

  if (isInitial) {
    serviceEntity.appendColumns(attributesToDisplay);
  } else {
    serviceEntity.updateColumns(
      attributesToDisplay,
      serviceEntity.attributes.isCollapsed,
    );
  }

  serviceEntity.set("instanceAttributes", serviceInstanceAttributes);

  if (isInitial && !serviceEntity.get("sanitizedAttrs")) {
    //for initial appending instanceAttributes are equal sanitized ones
    serviceEntity.set("sanitizedAttrs", serviceInstanceAttributes);
  }
}

/**
 * Function that create connection/link between two Entities
 * @param {dia.Graph} graph JointJS graph object
 * @param {ServiceEntityBlock} source JointJS shape object
 * @param {ServiceEntityBlock} target JointJS shape object
 * @param {boolean} isBlocked parameter determining whether we are showing tools for linkView
 * @returns {void}
 */
function connectEntities(
  graph: dia.Graph,
  source: ServiceEntityBlock,
  targets: ServiceEntityBlock[],
  isBlocked?: boolean,
): void {
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
  isBlockedFromEditing = false,
): ServiceEntityBlock[] {
  const { embedded_entities } = serviceModel;

  //iterate through embedded entities to create and connect them
  //we are basing iteration on service Model, if there is no value in the instance, skip that entity
  const createdEmbedded = embedded_entities
    .filter((entity) => !!attributesValues[entity.name])
    .flatMap((entity) => {
      const appendedEntities = appendEmbeddedEntity(
        paper,
        graph,
        entity,
        attributesValues[entity.name] as InstanceAttributeModel,
        instanceAsTable.id,
        serviceModel.name,
        presentedAttr,
        !serviceModel.strict_modifier_enforcement || isBlockedFromEditing,
      );

      connectEntities(
        graph,
        instanceAsTable,
        appendedEntities,
        !serviceModel.strict_modifier_enforcement,
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
 * Adds icon to the Entity with tooltip that tells on which set of attributes given shape is created
 * @param {ServiceEntityBlock} instanceAsTable created Entity
 * @param {"candidate" | "active"=} presentedAttrs *optional* indentify used set of attributes if they are taken from Service Instance
 * @returns {void}
 */
export function addInfoIcon(
  instanceAsTable: ServiceEntityBlock,
  presentedAttrs: "candidate" | "active",
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
  graph: dia.Graph,
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
            (relation) => relation.entity_type === relatedCell.getName(),
          );

          //if it has, we connect them
          if (relation) {
            relatedCell.set("cantBeRemoved", relation.modifier !== "rw+");
            connectEntities(
              graph,
              relatedCell,
              [cell],
              relation.modifier !== "rw+",
            );
          }
        }
      });
    }
  });
};
