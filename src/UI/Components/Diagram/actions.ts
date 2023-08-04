import { dia, g, layout, linkTools } from "@inmanta/rappid";
import dagre, { graphlib } from "dagre";
import {
  AttributeModel,
  EmbeddedEntity,
  InstanceAttributeModel,
  ServiceModel,
} from "@/Core";
import { InstanceWithReferences } from "@/Data/Managers/GetInstanceWithRelations/interface";
import { words } from "@/UI/words";
import activeImage from "./icons/active-icon.svg";
import candidateImage from "./icons/candidate-icon.svg";
import { EntityConnection, ServiceEntityBlock } from "./shapes";

/**
 * Function to display the methods to alter the connection objects - currently, the only function visible is the one removing connections.
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.LinkView
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#linkTools
 *
 * @param {dia.LinkView} linkView  - The view for the joint.dia.Link model.
 * @returns {void}
 */
export function showLinkTools(linkView: dia.LinkView) {
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
 * @returns {ServiceEntityBlock} appendedInstance to allow connect related Instances added concurrently
 */
export function appendInstance(
  paper: dia.Paper,
  graph: dia.Graph,
  serviceWithReferences: InstanceWithReferences,
  services: ServiceModel[],
  isMainInstance: boolean,
): ServiceEntityBlock {
  const serviceInstance = serviceWithReferences.instance.data;
  const ServiceInstanceModel = services.find(
    (model) => model.name === serviceInstance.service_entity,
  ) as ServiceModel;

  const instanceAsTable = new ServiceEntityBlock().setName(
    serviceInstance.service_entity,
  );

  if (!isMainInstance) {
    instanceAsTable.setTabColor("#0066CC");
  }

  //check for any presentable attributes, where candidate attrs have priority, if there is a set, then append them to  JointJS shape and try to display and connect embedded entities
  if (serviceInstance.candidate_attributes !== null) {
    handleAttributes(
      graph,
      paper,
      instanceAsTable,
      ServiceInstanceModel.attributes,
      serviceInstance.candidate_attributes,
      ServiceInstanceModel.embedded_entities,
      "candidate",
    );
  } else {
    handleAttributes(
      graph,
      paper,
      instanceAsTable,
      ServiceInstanceModel.attributes,
      serviceInstance.active_attributes as InstanceAttributeModel,
      ServiceInstanceModel.embedded_entities,
      "active",
    );
  }
  const appendedInstances = serviceWithReferences.relatedInstances.map(
    (relatedInstance) => {
      return appendInstance(paper, graph, relatedInstance, services, false);
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
): ServiceEntityBlock[] {
  //Create shape for Entity
  const flatAttributes = embeddedEntity.attributes.map(
    (attribute) => attribute.name,
  );

  if (Array.isArray(entityAttributes)) {
    const createdInstances: ServiceEntityBlock[] = [];

    (entityAttributes as InstanceAttributeModel[]).map((entityInstance) => {
      const instanceAsTable = new ServiceEntityBlock()
        .setTabColor("#0066CC")
        .setName(embeddedEntity.name);

      appendColumns(instanceAsTable, flatAttributes, entityInstance);

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
        );
        connectEntities(graph, instanceAsTable, appendedEntity);
      });
    });

    return createdInstances;
  } else {
    const instanceAsTable = new ServiceEntityBlock()
      .setTabColor("#0066CC")
      .setName(embeddedEntity.name);

    appendColumns(instanceAsTable, flatAttributes, entityAttributes);

    //add to graph
    instanceAsTable.addTo(graph);

    //iterate through embedded entities to create and connect them
    embeddedEntity.embedded_entities.map((entity) => {
      const appendedEntity = appendEmbeddedEntity(
        paper,
        graph,
        entity,
        entityAttributes[entity.name] as InstanceAttributeModel,
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
 * @returns {g.Rect} created JointJS shape
 */
export function appendEntity(
  paper: dia.Paper,
  graph: dia.Graph,
  serviceModel: ServiceModel,
  entity: InstanceAttributeModel,
  isCore: boolean,
): g.Rect {
  //Create shape for Entity
  const instanceAsTable = new ServiceEntityBlock().setName(serviceModel.name);

  if (!isCore) {
    instanceAsTable.setTabColor("#0066CC");
  }

  handleAttributes(
    graph,
    paper,
    instanceAsTable,
    serviceModel.attributes,
    entity,
    [],
  );

  //auto-layout provided by JointJS
  layout.DirectedGraph.layout(graph, {
    dagre: dagre,
    graphlib: graphlib,
    nodeSep: 80,
    edgeSep: 80,
    rankDir: "TB",
  });

  return instanceAsTable.getBBox();
}

/**
 *  Function that iterates through service instance attributes for values and appends in jointJS entity for display
 *
 * @param {ServiceEntityBlock} serviceEntity - shape of the entity to which columns will be appended
 * @param {string[]} attributesKeywords - names of the attributes that we iterate for the values
 * @param {InstanceAttributeModel} serviceInstanceAttributes - attributes of given instance/entity
 * @returns {void}
 */
function appendColumns(
  serviceEntity: ServiceEntityBlock,
  attributesKeywords: string[],
  serviceInstanceAttributes: InstanceAttributeModel,
) {
  serviceEntity.appendColumns(
    attributesKeywords.map((key) => {
      return {
        name: key,
        value: serviceInstanceAttributes[key] as string,
      };
    }),
  );
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
 * @param attributesModel - attributes model of given instance/entity
 * @param attributes - attributes of given instance/entity
 * @param embedded_entities - embedded entities of given instance/entity
 * @param {"candidate" | "active"=} presentedAttrs *optional* indentify used set of attributes if they are taken from Service Instance
 * @returns {void}
 */
function handleAttributes(
  graph: dia.Graph,
  paper: dia.Paper,
  instanceAsTable: ServiceEntityBlock,
  attributesModel: AttributeModel[],
  attributes: InstanceAttributeModel,
  embedded_entities: EmbeddedEntity[],
  presentedAttr?: "candidate" | "active",
) {
  const attributesNames = attributesModel.map((attribute) => attribute.name);
  handleInfoIcon(instanceAsTable, presentedAttr);

  appendColumns(instanceAsTable, attributesNames, attributes);
  //add to graph
  instanceAsTable.addTo(graph);

  //iterate through embedded entities to create and connect them
  embedded_entities.map((entity) => {
    const appendedEntities = appendEmbeddedEntity(
      paper,
      graph,
      entity,
      attributes[entity.name] as InstanceAttributeModel,
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
