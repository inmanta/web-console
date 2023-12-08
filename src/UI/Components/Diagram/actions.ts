import { dia, layout, linkTools } from "@inmanta/rappid";
import dagre, { graphlib } from "dagre";
import { EmbeddedEntity, InstanceAttributeModel, ServiceModel } from "@/Core";
import { InstanceWithReferences } from "@/Data/Managers/GetInstanceWithRelations/interface";
import { words } from "@/UI/words";
import activeImage from "./icons/active-icon.svg";
import candidateImage from "./icons/candidate-icon.svg";
import { ActionEnum, ConnectionRules, relationId } from "./interfaces";
import { EntityConnection, ServiceEntityBlock } from "./shapes";

/**
 * Function to display the methods to alter the connection objects - currently, the only function visible is the one removing connections.
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.LinkView
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#linkTools
 *
 *  * @param {dia.Graph} graph JointJS graph object
 * @param {dia.LinkView} linkView  - The view for the joint.dia.Link model.
 * @function {(cell: ServiceEntityBlock, action: ActionEnum): void} linkView  - The view for the joint.dia.Link model.
 * @returns {void}
 */
export function showLinkTools(
  graph: dia.Graph,
  linkView: dia.LinkView,
  updateInstancesToSend: (cell: ServiceEntityBlock, action: ActionEnum) => void,
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

  const targetName = targetCell.getName();
  const sourceName = sourceCell.getName();
  const doesTargetHaveRule = connectionRules[targetName].find(
    (rule) => rule.name === sourceName,
  );
  const doesSourceHaveRule = connectionRules[sourceName].find(
    (rule) => rule.name === targetName,
  );

  const isTargetInEditMode: boolean | undefined =
    targetCell.get("isInEditMode");
  const isSourceInEditMode: boolean | undefined =
    sourceCell.get("isInEditMode");

  if (
    isSourceInEditMode &&
    doesSourceHaveRule &&
    doesSourceHaveRule.modifier !== "rw+"
  ) {
    return;
  }
  if (
    isTargetInEditMode &&
    doesTargetHaveRule &&
    doesTargetHaveRule.modifier !== "rw+"
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
          let didSourceCellChanged = false;
          let didTargetCellChanged = false;

          const sourceCell = graph.getCell(
            source.id as dia.Cell.ID,
          ) as ServiceEntityBlock;
          const targetCell = graph.getCell(
            target.id as dia.Cell.ID,
          ) as ServiceEntityBlock;

          // resolve any possible embedded connections between cells, also we want to trigger update for both cells as
          // that's the last point where we can tell that one was the part of the other.
          if (
            sourceCell.get("isEmbedded") &&
            sourceCell.get("embeddedTo") === target.id
          ) {
            sourceCell.set("embeddedTo", null);
            didSourceCellChanged = true;
            didTargetCellChanged = true;
          }

          if (
            targetCell.get("isEmbedded") &&
            targetCell.get("embeddedTo") === source.id
          ) {
            targetCell.set("embeddedTo", null);
            didTargetCellChanged = true;
            didSourceCellChanged = true;
          }

          // resolve any possible relation connections between cells
          const sourceRelations = sourceCell.getRelations();
          const targetRelations = targetCell.getRelations();

          if (sourceRelations && sourceRelations.has(target.id as string)) {
            didSourceCellChanged = sourceCell.removeRelation(
              target.id as string,
            );
          }

          if (targetRelations && targetRelations.has(source.id as string)) {
            didTargetCellChanged = targetCell.removeRelation(
              source.id as string,
            );
          }

          if (didSourceCellChanged) {
            updateInstancesToSend(sourceCell, ActionEnum.UPDATE);
          }

          if (didTargetCellChanged) {
            updateInstancesToSend(targetCell, ActionEnum.UPDATE);
          }

          linkView.model.remove({ ui: true, tool: toolView.cid });
        },
      }),
    ],
  });

  linkView.addTools(tools);
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
  serviceWithReferences: InstanceWithReferences,
  services: ServiceModel[],
  isMainInstance = false,
  instanceToConnectRelation?: ServiceEntityBlock,
): ServiceEntityBlock {
  const serviceInstance = serviceWithReferences.instance.data;
  const serviceInstanceModel = services.find(
    (model) => model.name === serviceInstance.service_entity,
  ) as ServiceModel;
  const instanceAsTable = new ServiceEntityBlock().setName(
    serviceInstance.service_entity,
  );

  instanceAsTable.set("id", serviceWithReferences.instance.data.id);
  instanceAsTable.set("isEmbedded", false);
  instanceAsTable.set("isInEditMode", true);

  if (isMainInstance) {
    instanceAsTable.setTabColor("core");
  }

  //check for any presentable attributes, where candidate attrs have priority, if there is a set, then append them to  JointJS shape and try to display and connect embedded entities
  if (serviceInstance.candidate_attributes !== null) {
    handleAttributes(
      graph,
      paper,
      instanceAsTable,
      serviceInstanceModel,
      serviceInstance.candidate_attributes,
      "candidate",
      instanceToConnectRelation,
    );
  } else {
    handleAttributes(
      graph,
      paper,
      instanceAsTable,
      serviceInstanceModel,
      serviceInstance.active_attributes as InstanceAttributeModel,
      "active",
      instanceToConnectRelation,
    );
  }

  serviceWithReferences.relatedInstances.forEach((relatedInstance) => {
    const isInstanceMain = false;
    const cellAdded = graph.getCell(relatedInstance.instance.data.id);
    if (!cellAdded) {
      appendInstance(
        paper,
        graph,
        relatedInstance,
        services,
        isInstanceMain,
        instanceAsTable,
      );
    } else {
      //If cell is already in the graph, we need to check if it got in its inter-service relations the one with id that corresponds with created instanceAsTable
      let isConnected = false;
      const cellAsBlock = cellAdded as ServiceEntityBlock;
      const relations = cellAsBlock.getRelations();

      if (relations) {
        const connectedInstance = Array.from(relations, ([id, attrName]) => ({
          id,
          attrName,
        })).find(({ id }) => id === instanceAsTable.id);

        if (connectedInstance) {
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
      //as the fact that we have that cell as relatedInstance tells us that either that or its embedded entities has connection
      if (!isConnected) {
        const neighbors = graph.getNeighbors(cellAdded as dia.Element);
        neighbors.map((cell) => {
          const neighborRelations = (cell as ServiceEntityBlock).getRelations();
          if (neighborRelations) {
            const connectedInstance = Array.from(
              neighborRelations,
              ([id, attrName]) => ({ id, attrName }),
            ).find(({ id }) => id === instanceAsTable.id);
            if (connectedInstance) {
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
  //auto-layout provided by JointJS
  layout.DirectedGraph.layout(graph, {
    dagre: dagre,
    graphlib: graphlib,
    nodeSep: 80,
    edgeSep: 80,
    rankDir: "TB",
  });

  return instanceAsTable;
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
 * @param {string} holderType - name of the entity type in which is embedded
 * @param {ServiceEntityBlock} instanceToConnectRelation - eventual shape to which inter-service relations should be connected
 * @returns {ServiceEntityBlock[]} created JointJS shapes
 */
export function appendEmbeddedEntity(
  paper: dia.Paper,
  graph: dia.Graph,
  embeddedEntity: EmbeddedEntity,
  entityAttributes: InstanceAttributeModel,
  embeddedTo: string | null,
  holderType: string,
  instanceToConnectRelation?: ServiceEntityBlock,
  presentedAttr?: "candidate" | "active",
  isBlockedFromEditing?: boolean,
): ServiceEntityBlock[] {
  //Create shape for Entity
  const flatAttributes = embeddedEntity.attributes.map(
    (attribute) => attribute.name,
  );

  if (Array.isArray(entityAttributes)) {
    const createdInstances: ServiceEntityBlock[] = [];

    (entityAttributes as InstanceAttributeModel[]).map((entityInstance) => {
      const instanceAsTable = new ServiceEntityBlock()
        .setTabColor("embedded")
        .setName(embeddedEntity.name);

      appendColumns(instanceAsTable, flatAttributes, entityInstance);
      instanceAsTable.set("isEmbedded", true);
      instanceAsTable.set("holderType", holderType);
      instanceAsTable.set("embeddedTo", embeddedTo);
      instanceAsTable.set("isInEditMode", true);
      instanceAsTable.set("isBlockedFromEditing", isBlockedFromEditing);
      //add to graph
      instanceAsTable.addTo(graph);

      createdInstances.push(instanceAsTable);
      //iterate through embedded entities to create and connect them
      embeddedEntity.embedded_entities.forEach((entity) => {
        //we are basing iteration on service Model, if there is no value in the instance, skip that part
        if (!entityInstance[entity.name]) {
          return;
        }
        const appendedEntities = appendEmbeddedEntity(
          paper,
          graph,
          entity,
          entityInstance[entity.name] as InstanceAttributeModel,
          instanceAsTable.id as string,
          embeddedEntity.name,
          instanceToConnectRelation,
          presentedAttr,
          isBlockedFromEditing,
        );
        appendedEntities.map((appendedEntities) => {
          handleInfoIcon(appendedEntities, presentedAttr);
        });
        connectEntities(
          graph,
          instanceAsTable,
          appendedEntities,
          isBlockedFromEditing,
        );
      });

      embeddedEntity.inter_service_relations?.map((relation) => {
        const relationId = entityAttributes[relation.name] as relationId;
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
    });

    return createdInstances;
  } else {
    const instanceAsTable = new ServiceEntityBlock()
      .setTabColor("embedded")
      .setName(embeddedEntity.name);

    appendColumns(instanceAsTable, flatAttributes, entityAttributes);
    instanceAsTable.set("isEmbedded", true);
    instanceAsTable.set("holderType", holderType);
    instanceAsTable.set("embeddedTo", embeddedTo);
    instanceAsTable.set("isBlockedFromEditing", isBlockedFromEditing);
    instanceAsTable.set("isInEditMode", true);

    //add to graph
    instanceAsTable.addTo(graph);

    //iterate through embedded entities to create and connect them
    embeddedEntity.embedded_entities.forEach((entity) => {
      const appendedEntity = appendEmbeddedEntity(
        paper,
        graph,
        entity,
        entityAttributes[entity.name] as InstanceAttributeModel,
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
      const relationId = entityAttributes[relation.name] as relationId;
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
    return [instanceAsTable];
  }
}

/**
 * Function that creates, appends and returns created Entity, differs from appendInstance by the fact that is used from the scope of Instance Composer and uses different set of data
 *
 * @param {dia.Graph} graph JointJS graph object
 * @param {dia.Paper} paper JointJS paper object
 * @param {ServiceModel} serviceModel that we want to base created entity on
 * @param {InstanceAttributeModel} entity created in the from
 * @param {boolean} isCore defines whether created entity is main one in given View
 * @returns {ServiceEntityBlock} created JointJS shape
 */
export function appendEntity(
  graph: dia.Graph,
  serviceModel: ServiceModel,
  entity: InstanceAttributeModel,
  isCore: boolean,
  isEmbedded = false,
  holderType = "",
): ServiceEntityBlock {
  //Create shape for Entity
  const instanceAsTable = new ServiceEntityBlock().setName(serviceModel.name);

  if (isEmbedded) {
    instanceAsTable.setTabColor("embedded");
  } else if (isCore) {
    instanceAsTable.setTabColor("core");
  }

  instanceAsTable.set("isEmbedded", isEmbedded);
  instanceAsTable.set("holderType", holderType);

  if (
    serviceModel.inter_service_relations &&
    serviceModel.inter_service_relations.length > 0
  ) {
    instanceAsTable.set("relatedTo", new Map());
  }
  const attributesNames = serviceModel.attributes.map(
    (attribute) => attribute.name,
  );

  appendColumns(instanceAsTable, attributesNames, entity);
  //add to graph
  instanceAsTable.addTo(graph);
  //auto-layout provided by JointJS
  layout.DirectedGraph.layout(graph, {
    dagre: dagre,
    graphlib: graphlib,
    nodeSep: 80,
    edgeSep: 80,
    rankDir: "TB",
  });

  return instanceAsTable;
}

/**
 *  Function that iterates through service instance attributes for values and appends in jointJS entity for display
 *
 * @param {ServiceEntityBlock} serviceEntity - shape of the entity to which columns will be appended
 * @param {string[]} attributesKeywords - names of the attributes that we iterate for the values
 * @param {InstanceAttributeModel} serviceInstanceAttributes - attributes of given instance/entity
 * @param {boolean=true} isInitial - boolean indicating whether should we appendColumns or edit - default = true
 * @returns {void}
 */
export function appendColumns(
  serviceEntity: ServiceEntityBlock,
  attributesKeywords: string[],
  serviceInstanceAttributes: InstanceAttributeModel,
  isInitial = true,
) {
  const instanceAttributes = {};
  const attributes = attributesKeywords.map((key) => {
    instanceAttributes[key] = serviceInstanceAttributes[key];
    return {
      name: key,
      value: serviceInstanceAttributes[key] as string,
    };
  });
  serviceEntity.set("instanceAttributes", instanceAttributes);

  if (isInitial) {
    serviceEntity.appendColumns(attributes);
  } else {
    serviceEntity.editColumns(attributes, serviceEntity.attributes.isCollapsed);
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
    const link = new EntityConnection();
    if (isBlocked) {
      link.set("isBlockedFromEditing", isBlocked);
    }
    link.source(source);
    link.target(target);
    link.addTo(graph);
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
function handleAttributes(
  graph: dia.Graph,
  paper: dia.Paper,
  instanceAsTable: ServiceEntityBlock,
  serviceModel: ServiceModel,
  attributesValues: InstanceAttributeModel,
  presentedAttr?: "candidate" | "active",
  instanceToConnectRelation?: ServiceEntityBlock,
) {
  const { attributes, embedded_entities } = serviceModel;
  const attributesNames = attributes.map((attribute) => attribute.name);
  handleInfoIcon(instanceAsTable, presentedAttr);
  appendColumns(instanceAsTable, attributesNames, attributesValues);
  instanceAsTable.set(
    "isBlockedFromEditing",
    !serviceModel.strict_modifier_enforcement,
  );
  //add to graph
  instanceAsTable.addTo(graph);

  //iterate through embedded entities to create and connect them
  embedded_entities.forEach((entity) => {
    //we are basing iteration on service Model, if there is no value in the instance, skip that entity
    if (!attributesValues[entity.name]) {
      return;
    }
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
  });

  serviceModel.inter_service_relations?.forEach((relation) => {
    const relationId = attributesValues[relation.name] as string;

    if (relationId) {
      instanceAsTable.addRelation(relationId, relation.name);
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
    }
  });
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
