import { dia, linkTools } from "@inmanta/rappid";
import { DirectedGraph } from "@joint/layout-directed-graph";
import { EmbeddedEntity, InstanceAttributeModel, ServiceModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Managers/V2/GetInstanceWithRelations";
import { words } from "@/UI/words";
import {
  CreateModifierHandler,
  FieldCreator,
  createFormState,
} from "../ServiceInstanceForm";
import { findCorrespondingId, toggleLooseElement } from "./helpers";
import activeImage from "./icons/active-icon.svg";
import candidateImage from "./icons/candidate-icon.svg";
import {
  ActionEnum,
  ConnectionRules,
  EmbeddedEventEnum,
  relationId,
} from "./interfaces";
import { Link, ServiceEntityBlock } from "./shapes";

/**
 * Function to display the methods to alter the connection objects - currently, the only function visible is the one removing connections.
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.LinkView
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#linkTools
 *
 * @param {dia.Paper} paper JointJS paper object
 * @param {dia.Graph} graph JointJS graph object
 * @param {dia.LinkView} linkView  - The view for the joint.dia.Link model.
 * @function {(cell: ServiceEntityBlock, action: ActionEnum): void} linkView  - The view for the joint.dia.Link model.
 * @returns {void}
 */
export function showLinkTools(
  paper: dia.Paper,
  graph: dia.Graph,
  linkView: dia.LinkView,
  connectionRules: ConnectionRules,
) {
  const source = linkView.model.source();
  const target = linkView.model.target();

  const sourceCell = graph.getCell(
    source.id as dia.Cell.ID,
  ) as ServiceEntityBlock;
  const targetCell = graph.getCell(
    target.id as dia.Cell.ID,
  ) as ServiceEntityBlock;

  /**
   * checks if the connection between cells can be deleted thus if we should hide linkTool
   * @param cellOne ServiceEntityBlock
   * @param cellTwo ServiceEntityBlock
   * @returns boolean
   */
  const shouldHideLinkTool = (
    cellOne: ServiceEntityBlock,
    cellTwo: ServiceEntityBlock,
  ) => {
    const nameOne = cellOne.getName();
    const nameTwo = cellTwo.getName();

    const elementConnectionRule = connectionRules[nameOne].find(
      (rule) => rule.name === nameTwo,
    );

    const isElementInEditMode: boolean | undefined =
      cellOne.get("isInEditMode");

    if (
      isElementInEditMode &&
      elementConnectionRule &&
      elementConnectionRule.modifier !== "rw+"
    ) {
      return true;
    }

    return false;
  };

  if (
    shouldHideLinkTool(sourceCell, targetCell) ||
    shouldHideLinkTool(targetCell, sourceCell)
  ) {
    return;
  }

  const tools = new dia.ToolsView({
    tools: [
      new linkTools.Remove({
        distance: "50%",
        markup: [
          {
            tagName: "circle",
            selector: "button",
            attributes: {
              r: 7,
              class: "joint-link_remove-circle",
              "stroke-width": 2,
              cursor: "pointer",
            },
          },
          {
            tagName: "path",
            selector: "icon",
            attributes: {
              d: "M -3 -3 3 3 M -3 3 3 -3",
              class: "joint-link_remove-path",
              "stroke-width": 2,
              "pointer-events": "none",
            },
          },
        ],
        action: (_evt, linkView: dia.LinkView, toolView: dia.ToolView) => {
          const source = linkView.model.source();
          const target = linkView.model.target();

          const sourceCell = graph.getCell(
            source.id as dia.Cell.ID,
          ) as ServiceEntityBlock;
          const targetCell = graph.getCell(
            target.id as dia.Cell.ID,
          ) as ServiceEntityBlock;

          /**
           * Function that remove any data in this connection between cells
           * @param elementCell cell that we checking
           * @param disconnectingCell cell that is being connected to elementCell
           * @returns boolean whether connections was set
           */
          const removeConnectionData = (
            elementCell: ServiceEntityBlock,
            disconnectingCell: ServiceEntityBlock,
          ): void => {
            const elementRelations = elementCell.getRelations();

            // resolve any possible embedded connections between cells,
            if (
              elementCell.get("isEmbedded") &&
              elementCell.get("embeddedTo") === disconnectingCell.id
            ) {
              elementCell.set("embeddedTo", undefined);
              toggleLooseElement(
                paper.findViewByModel(elementCell),
                EmbeddedEventEnum.ADD,
              );

              document.dispatchEvent(
                new CustomEvent("updateInstancesToSend", {
                  detail: { cell: elementCell, actions: ActionEnum.UPDATE },
                }),
              );
            }

            // resolve any possible relation connections between cells
            if (
              elementRelations &&
              elementRelations.has(String(disconnectingCell.id))
            ) {
              elementCell.removeRelation(String(disconnectingCell.id));

              document.dispatchEvent(
                new CustomEvent("updateInstancesToSend", {
                  detail: { cell: sourceCell, actions: ActionEnum.UPDATE },
                }),
              );
            }
          };

          //as the connection between two cells is bidirectional we need attempt to remove data from both cells
          removeConnectionData(sourceCell, targetCell);
          removeConnectionData(targetCell, sourceCell);

          linkView.model.remove({ ui: true, tool: toolView.cid });
        },
      }),
    ],
  });

  linkView.addTools(tools);
}

/**
 * Function that creates, appends and returns created Entity, differs from appendInstance by the fact that is used from the scope of Instance Composer and uses different set of data
 *
 * @param {ServiceModel} serviceModel that we want to base created entity on
 * @param {InstanceAttributeModel} entity created in the from
 * @param {boolean} isCore defines whether created entity is main one in given View
 * @param {boolean} isInEditMode defines whether created entity is is representation of existing instance or new one
 * @param {string} holderName - name of the entity to which it is embedded/connected
 * @returns {ServiceEntityBlock} created JointJS shape
 */
export function createEntity(
  serviceModel: ServiceModel | EmbeddedEntity,
  isCore: boolean,
  attributes: InstanceAttributeModel | undefined = undefined,
  isInEditMode: boolean,
  isEmbedded = false,
  holderName = "",
): ServiceEntityBlock {
  //Create shape for Entity
  const instanceAsTable = new ServiceEntityBlock().setName(serviceModel.name);

  if (isEmbedded) {
    instanceAsTable.setTabColor("embedded");
    instanceAsTable.set("isEmbedded", isEmbedded);
    instanceAsTable.set("holderName", holderName);
  } else if (isCore) {
    instanceAsTable.set("isCore", isCore);
    instanceAsTable.setTabColor("core");
  }

  instanceAsTable.set("isInEditMode", isInEditMode);
  instanceAsTable.set("serviceModel", serviceModel);

  if (
    serviceModel.inter_service_relations &&
    serviceModel.inter_service_relations.length > 0
  ) {
    instanceAsTable.set("relatedTo", new Map());
  }

  updateAttributes(
    instanceAsTable,
    serviceModel.key_attributes || [],
    attributes,
    true,
  );

  return instanceAsTable;
}

/**
 * This function converts Instance attributes to display them on the Smart Service Composer canvas.
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.Graph
 *
 * @param {dia.Graph} graph JointJS graph object
 * @param {dia.Paper} paper JointJS paper object
 * @param {ServiceInstanceModel} serviceInstance that we want to display
 * @param {ServiceModel} service that hold definitions for attributes which we want to display as instance Object doesn't differentiate core attributes from i.e. embedded entities
 * @param {boolean} isMainInstance boolean value determining if the instance is the core one
 * @param {string} relatedTo id of the service instance with which appended instance has relation
 * @returns {ServiceEntityBlock} appendedInstance to allow connect related Instances added concurrently
 */
export function appendInstance(
  paper: dia.Paper,
  graph: dia.Graph,
  instanceWithRelations: InstanceWithRelations,
  services: ServiceModel[],
  isMainInstance = true,
  instanceToConnectRelation?: ServiceEntityBlock,
): ServiceEntityBlock[] {
  const serviceInstance = instanceWithRelations.instance;
  const serviceInstanceModel = services.find(
    (model) => model.name === serviceInstance.service_entity,
  );

  if (!serviceInstanceModel) {
    throw Error(words("instanceComposer.errorMessage"));
  }

  const attributes =
    serviceInstance.candidate_attributes ||
    serviceInstance.active_attributes ||
    undefined;
  const isInEditMode = true;

  const instanceAsTable = createEntity(
    serviceInstanceModel,
    isMainInstance,
    attributes,
    isInEditMode,
  );

  instanceAsTable.set("id", instanceWithRelations.instance.id);

  instanceAsTable.set(
    "isBlockedFromEditing",
    !serviceInstanceModel.strict_modifier_enforcement || !isMainInstance,
  );

  instanceAsTable.addTo(graph);

  let embeddedEntities: ServiceEntityBlock[] = [];

  //check for any presentable attributes, where candidate attrs have priority, if there is a set, then append them to  JointJS shape and try to display and connect embedded entities
  if (serviceInstance.candidate_attributes) {
    embeddedEntities = handleNonDirectAttributes(
      graph,
      paper,
      instanceAsTable,
      serviceInstanceModel,
      serviceInstance.candidate_attributes,
      "candidate",
      instanceToConnectRelation,
    );
  } else if (serviceInstance.active_attributes) {
    embeddedEntities = handleNonDirectAttributes(
      graph,
      paper,
      instanceAsTable,
      serviceInstanceModel,
      serviceInstance.active_attributes,
      "active",
      instanceToConnectRelation,
    );
  }

  if (instanceWithRelations.relatedInstances) {
    //map through relatedInstances and either append them or connect to them
    instanceWithRelations.relatedInstances.forEach((relatedInstance) => {
      const cellAdded = graph.getCell(relatedInstance.id);

      if (!cellAdded) {
        appendInstance(
          paper,
          graph,
          { instance: relatedInstance },
          services,
          false,
          instanceAsTable,
        );
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
        console.log(isConnected);
        //If doesn't, or the one we are looking for isn't among the ones stored, we need go through every connected shape and do the same assertion,
        //as the fact that we have that cell as relatedInstance tells us that either that or its embedded entities has connection
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
    });
  }

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
 * @param {ServiceEntityBlock} instanceToConnectRelation - eventual shape to which inter-service relations should be connected
 * @returns {ServiceEntityBlock[]} created JointJS shapes
 */
export function appendEmbeddedEntity(
  paper: dia.Paper,
  graph: dia.Graph,
  embeddedEntity: EmbeddedEntity,
  entityAttributes: InstanceAttributeModel | InstanceAttributeModel[],
  embeddedTo: string | null,
  holderName: string,
  instanceToConnectRelation?: ServiceEntityBlock,
  presentedAttr?: "candidate" | "active",
  isBlockedFromEditing?: boolean,
): ServiceEntityBlock[] {
  //Create shape for Entity

  /**
   *  Create single Embedded Entity, and handle setting all of the essential data and append it and it's eventual children to the graph.
   * Then connect it with it's eventual children and other entities that have inter-service relation to this Entity
   *
   * @param entityInstance instance of entity Attributes
   * @returns ServiceEntityBlock
   */
  function appendSingleEntity(
    entityInstance: InstanceAttributeModel,
  ): ServiceEntityBlock {
    const isCore = false;
    const isInEditMode = false;
    const isEmbedded = true;

    //Create shape for Entity
    const instanceAsTable = createEntity(
      embeddedEntity,
      isCore,
      entityInstance,
      isInEditMode,
      isEmbedded,
      holderName,
    );

    instanceAsTable.set("embeddedTo", embeddedTo);
    instanceAsTable.set("isBlockedFromEditing", isBlockedFromEditing);

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
        entity.name,
        instanceToConnectRelation,
        presentedAttr,
        isBlockedFromEditing,
      );

      appendedEntity.forEach((entity) => {
        handleInfoIcon(entity, presentedAttr);
      });
      connectEntities(
        graph,
        instanceAsTable,
        appendedEntity,
        isBlockedFromEditing,
      );
    });

    embeddedEntity.inter_service_relations?.map((relation) => {
      const relationId = entityInstance[relation.name] as relationId;

      if (relationId) {
        instanceAsTable.addRelation(relationId, relation.name);
        if (
          instanceToConnectRelation &&
          relationId === instanceToConnectRelation.id
        ) {
          connectEntities(
            graph,
            instanceAsTable,
            [instanceToConnectRelation],
            isBlockedFromEditing,
          );
        }
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
 * @returns {ServiceEntityBlock[]} An array containing the core entity and the default entities added to the graph.
 */
export function populateGraphWithDefault(
  graph: dia.Graph,
  serviceModel: ServiceModel,
) {
  //the most realiable way to get attributes default state is to use Field Creator

  const fieldCreator = new FieldCreator(new CreateModifierHandler());
  const fields = fieldCreator.attributesToFields(serviceModel.attributes);

  const attrs = createFormState(fields);
  const isCore = true;
  const isInEditMode = false;

  const coreEntity = createEntity(serviceModel, isCore, attrs, isInEditMode);

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

  return [coreEntity, ...defaultEntities];
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
  //all entities created here are embedded entities
  const isCore = false;
  const isInEditMode = false;
  const isEmbedded = true;

  const embedded_entities = service.embedded_entities
    .filter((embedded_entity) => embedded_entity.lower_limit > 0)
    .map((embedded_entity) => {
      const fieldCreator = new FieldCreator(new CreateModifierHandler());
      const fields = fieldCreator.attributesToFields(
        embedded_entity.attributes,
      );
      const attrs = createFormState(fields);

      const embeddedEntity = createEntity(
        embedded_entity,
        isCore,
        attrs,
        isInEditMode,
        isEmbedded,
        service.name,
      );

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
  serviceInstanceAttributes: InstanceAttributeModel | undefined,
  isInitial = true,
) {
  // const instanceAttributes = {};
  // const attributes = attributesKeywords.map((key) => {
  //   const attributeValue = isEmpty ? "" : serviceInstanceAttributes[key];

  //   instanceAttributes[key] = attributeValue;

  const attributesToDisplay = keyAttributes.map((key) => {
    const value = serviceInstanceAttributes
      ? (serviceInstanceAttributes[key] as string)
      : "";

    return {
      name: key,
      value: value || "",
    };
  });

  // serviceEntity.set("instanceAttributes", instanceAttributes);

  if (isInitial) {
    serviceEntity.appendColumns(attributesToDisplay);
  } else {
    serviceEntity.editColumns(
      attributesToDisplay,
      serviceEntity.attributes.isCollapsed,
    );
  }

  if (!serviceInstanceAttributes) {
    return;
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
) {
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
 * Function that appends attributes into the entity and creates nested embedded entities that relates to given instance/entity
 *
 * @param {dia.Graph} graph JointJS graph object
 * @param {dia.Paper} paper JointJS paper object
 * @param {ServiceEntityBlock} instanceAsTable created Entity
 * @param {ServiceModel} serviceModel - serviceModel model of given instance/entity
 * @param {InstanceAttributeModel} attributesValues - attributes of given instance/entity
 * @param {"candidate" | "active"} presentedAttrs *optional* identify used set of attributes if they are taken from Service Instance
 * @param {ServiceEntityBlock=} instanceToConnectRelation *optional* shape to which eventually should embedded entity or  be connected to
 *
 * @returns {void}
 */
function handleNonDirectAttributes(
  graph: dia.Graph,
  paper: dia.Paper,
  instanceAsTable: ServiceEntityBlock,
  serviceModel: ServiceModel,
  attributesValues: InstanceAttributeModel,
  presentedAttr?: "candidate" | "active",
  instanceToConnectRelation?: ServiceEntityBlock,
): ServiceEntityBlock[] {
  const { embedded_entities } = serviceModel;

  handleInfoIcon(instanceAsTable, presentedAttr);

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
        instanceAsTable.id as string,
        serviceModel.name,
        instanceToConnectRelation,
        presentedAttr,
        !serviceModel.strict_modifier_enforcement,
      );

      appendedEntities.map((entity) => {
        handleInfoIcon(entity, presentedAttr);
      });

      connectEntities(
        graph,
        instanceAsTable,
        appendedEntities,
        !serviceModel.strict_modifier_enforcement,
      );

      return appendedEntities;
    });

  serviceModel.inter_service_relations?.forEach((relation) => {
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
    if (
      instanceToConnectRelation &&
      instanceToConnectRelation.id &&
      relationId
    ) {
      connectEntities(
        graph,
        instanceAsTable,
        [instanceToConnectRelation],
        !serviceModel.strict_modifier_enforcement,
      );
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
function handleInfoIcon(
  instanceAsTable: ServiceEntityBlock,
  presentedAttrs?: "candidate" | "active",
) {
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
  } else if (presentedAttrs === "active") {
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
