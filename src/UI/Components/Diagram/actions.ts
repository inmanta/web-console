import { dia, layout, linkTools } from "@inmanta/rappid";
import dagre, { graphlib } from "dagre";
import { EmbeddedEntity, InstanceAttributeModel, ServiceModel } from "@/Core";
import { InstanceWithReferences } from "@/Data/Managers/GetInstanceWithRelations/interface";
import { words } from "@/UI/words";
import activeImage from "./icons/active-icon.svg";
import candidateImage from "./icons/candidate-icon.svg";
import { Colors, EntityConnection, ServiceEntityBlock } from "./shapes";

/**
 * Function to display the methods to alter the connection objects - currently, the only function visible is the one removing connections.
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.LinkView
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#linkTools
 *
 * @param {dia.LinkView} linkView  - The view for the joint.dia.Link model.
 * @returns {void}
 */
export function showLinkTools(graph: dia.Graph, linkView: dia.LinkView) {
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
              fill: "#f6f6f6",
              stroke: "#ff5148",
              "stroke-width": 2,
              cursor: "pointer",
            },
          },
          {
            tagName: "path",
            selector: "icon",
            attributes: {
              d: "M -3 -3 3 3 M -3 3 3 -3",
              fill: "none",
              stroke: "#ff5148",
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

          // resolve any possible embedded connections between cells
          if (
            sourceCell.get("isEmbedded") &&
            sourceCell.get("embeddedTo") === target.id
          ) {
            sourceCell.set("embeddedTo", null);
          }

          if (
            targetCell.get("isEmbedded") &&
            targetCell.get("embeddedTo") === source.id
          ) {
            targetCell.set("embeddedTo", null);
          }

          // resolve any possible relation connections between cells
          const sourceRelations = sourceCell.getRelations();
          const targetRelations = targetCell.getRelations();

          if (sourceRelations && sourceRelations.has(target.id as string)) {
            sourceCell.removeRelation(target.id as string);
          }

          if (targetRelations && targetRelations.has(source.id as string)) {
            targetCell.removeRelation(source.id as string);
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
  isMainInstance: boolean,
  relatedTo: { id: string; name: string } | null = null,
): ServiceEntityBlock {
  const serviceInstance = serviceWithReferences.instance.data;
  const ServiceInstanceModel = services.find(
    (model) => model.name === serviceInstance.service_entity,
  ) as ServiceModel;

  const instanceAsTable = new ServiceEntityBlock().setName(
    serviceInstance.service_entity,
  );

  instanceAsTable.set("id", serviceWithReferences.instance.data.id);
  if (relatedTo) {
    instanceAsTable.addRelation(relatedTo.id, relatedTo.name);
  }
  instanceAsTable.set("isEmbedded", false);

  if (!isMainInstance) {
    instanceAsTable.setTabColor(Colors.base);
  }

  //check for any presentable attributes, where candidate attrs have priority, if there is a set, then append them to  JointJS shape and try to display and connect embedded entities
  if (serviceInstance.candidate_attributes !== null) {
    handleAttributes(
      graph,
      paper,
      instanceAsTable,
      ServiceInstanceModel,
      serviceInstance.candidate_attributes,
      "candidate",
    );
  } else {
    handleAttributes(
      graph,
      paper,
      instanceAsTable,
      ServiceInstanceModel,
      serviceInstance.active_attributes as InstanceAttributeModel,
      "active",
    );
  }
  const appendedInstances = serviceWithReferences.relatedInstances.map(
    (relatedInstance) => {
      return appendInstance(paper, graph, relatedInstance, services, false, {
        id: serviceWithReferences.instance.data.id,
        name: serviceWithReferences.instance.data.service_entity,
      });
    },
  );
  connectEntities(graph, instanceAsTable, appendedInstances);

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
 * @returns {ServiceEntityBlock[]} created JointJS shapes
 */
export function appendEmbeddedEntity(
  paper: dia.Paper,
  graph: dia.Graph,
  embeddedEntity: EmbeddedEntity,
  entityAttributes: InstanceAttributeModel,
  embeddedTo: string | null,
  holderType: string,
): ServiceEntityBlock[] {
  //Create shape for Entity
  const flatAttributes = embeddedEntity.attributes.map(
    (attribute) => attribute.name,
  );

  if (Array.isArray(entityAttributes)) {
    const createdInstances: ServiceEntityBlock[] = [];

    (entityAttributes as InstanceAttributeModel[]).map((entityInstance) => {
      const instanceAsTable = new ServiceEntityBlock()
        .setTabColor(Colors.embedded)
        .setName(embeddedEntity.name);

      appendColumns(instanceAsTable, flatAttributes, entityInstance);
      instanceAsTable.set("isEmbedded", true);
      instanceAsTable.set("holderType", holderType);
      instanceAsTable.set("embeddedTo", embeddedTo);

      //add to graph
      instanceAsTable.addTo(graph);

      createdInstances.push(instanceAsTable);

      //iterate through embedded entities to create and connect them
      embeddedEntity.embedded_entities.map((entity) => {
        const appendedEntity = appendEmbeddedEntity(
          paper,
          graph,
          entity,
          entityInstance[entity.name] as InstanceAttributeModel,
          instanceAsTable.id as string,
          embeddedEntity.name,
        );
        connectEntities(graph, instanceAsTable, appendedEntity);
      });
    });

    return createdInstances;
  } else {
    const instanceAsTable = new ServiceEntityBlock()
      .setTabColor(Colors.embedded)
      .setName(embeddedEntity.name);

    appendColumns(instanceAsTable, flatAttributes, entityAttributes);
    instanceAsTable.set("isEmbedded", true);
    instanceAsTable.set("holderType", holderType);
    instanceAsTable.set("embeddedTo", embeddedTo);

    //add to graph
    instanceAsTable.addTo(graph);

    //iterate through embedded entities to create and connect them
    embeddedEntity.embedded_entities.map((entity) => {
      const appendedEntity = appendEmbeddedEntity(
        paper,
        graph,
        entity,
        entityAttributes[entity.name] as InstanceAttributeModel,
        instanceAsTable.id as string,
        entity.name,
      );
      connectEntities(graph, instanceAsTable, appendedEntity);
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
): ServiceEntityBlock {
  //Create shape for Entity
  const instanceAsTable = new ServiceEntityBlock().setName(serviceModel.name);

  if (!isCore) {
    instanceAsTable.setTabColor(Colors.base);
  }
  if (isEmbedded) {
    instanceAsTable.setTabColor(Colors.embedded);
  }
  instanceAsTable.set("isEmbedded", isEmbedded);

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
 * @returns {void}
 */
export function appendColumns(
  serviceEntity: ServiceEntityBlock,
  attributesKeywords: string[],
  serviceInstanceAttributes: InstanceAttributeModel,
  isInitial = true,
) {
  serviceEntity.set("instanceAttributes", serviceInstanceAttributes);
  const attributes = attributesKeywords.map((key) => {
    return {
      name: key,
      value: serviceInstanceAttributes[key] as string,
    };
  });
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
 * @returns {void}
 */
function connectEntities(
  graph: dia.Graph,
  source: ServiceEntityBlock,
  targets: ServiceEntityBlock[],
) {
  targets.map((target) => {
    const link = new EntityConnection();
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
 * @param serviceModel - serviceModel model of given instance/entity
 * @param attributesValues - attributes of given instance/entity
 * @param {"candidate" | "active"=} presentedAttrs *optional* indentify used set of attributes if they are taken from Service Instance
 * @returns {void}
 */
function handleAttributes(
  graph: dia.Graph,
  paper: dia.Paper,
  instanceAsTable: ServiceEntityBlock,
  serviceModel: ServiceModel,
  attributesValues: InstanceAttributeModel,
  presentedAttr?: "candidate" | "active",
) {
  const { attributes, embedded_entities } = serviceModel;
  const attributesNames = attributes.map((attribute) => attribute.name);
  handleInfoIcon(instanceAsTable, presentedAttr);
  appendColumns(instanceAsTable, attributesNames, attributesValues);
  //add to graph
  instanceAsTable.addTo(graph);

  //iterate through embedded entities to create and connect them
  embedded_entities.map((entity) => {
    const appendedEntities = appendEmbeddedEntity(
      paper,
      graph,
      entity,
      attributesValues[entity.name] as InstanceAttributeModel,
      instanceAsTable.id as string,
      serviceModel.name,
    );
    appendedEntities.map((entity) => {
      handleInfoIcon(entity, presentedAttr);
    });
    connectEntities(graph, instanceAsTable, appendedEntities);
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
