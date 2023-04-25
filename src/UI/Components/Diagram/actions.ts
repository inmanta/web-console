import { dia, layout, linkTools } from "@inmanta/rappid";
import dagre, { graphlib } from "dagre";
import {
  EmbeddedEntity,
  InstanceAttributeModel,
  ServiceInstanceModel,
  ServiceModel,
} from "@/Core";
import { EntityConnection, ServiceEntityBlock } from "./shapes";
/**
 * Function that displays methods to alter connection objects - currently visible is only function to remove connection
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.LinkView
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#linkTools
 *
 * @param linkView The view for the joint.dia.Link model.
 * @returns void
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
      new linkTools.SourceArrowhead(),
      new linkTools.TargetArrowhead(),
    ],
  });
  linkView.addTools(tools);
}

/**
 * Function converts instance attributes in a way that they are possible to display on composer canvas
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.Graph
 *
 * @param {dia.Graph} graph JointJS Object on which we are appending given instance
 * @param {ServiceInstanceModel} serviceInstance that we want to display
 * @param {ServiceModel} service that hold definitions for attributes which we want to display as instance Object doesn't differentiate core attributes from i.e. embedded entities
 * @returns {void}
 */
export function appendInstance(
  graph: dia.Graph,
  serviceInstance: ServiceInstanceModel,
  service: ServiceModel
) {
  const flatAttributes = service.attributes.map((attribute) => attribute.name);

  const instanceAsTable = new ServiceEntityBlock().setName(
    serviceInstance.service_entity
  );
  //check if for any presentable attributes, if there is a set, then append them to  JointJS shape and try to display and connect embedded entities
  if (serviceInstance.active_attributes !== null) {
    appendColumns(
      instanceAsTable,
      flatAttributes,
      serviceInstance.active_attributes
    );
    instanceAsTable.addTo(graph);

    service.embedded_entities.map((entity) => {
      const appendedEntity = appendEmbeddedEntity(
        graph,
        entity,
        (serviceInstance.active_attributes as InstanceAttributeModel)[
          entity.name
        ] as InstanceAttributeModel
      );
      connectEntities(graph, instanceAsTable, appendedEntity);
    });
  } else if (serviceInstance.candidate_attributes !== null) {
    appendColumns(
      instanceAsTable,
      flatAttributes,
      serviceInstance.candidate_attributes
    );

    instanceAsTable.addTo(graph);
    service.embedded_entities.map((entity) => {
      const appendedEntity = appendEmbeddedEntity(
        graph,
        entity,
        (serviceInstance.candidate_attributes as InstanceAttributeModel)[
          entity.name
        ] as InstanceAttributeModel
      );
      connectEntities(graph, instanceAsTable, appendedEntity);
    });
  } else if (serviceInstance.rollback_attributes !== null) {
    appendColumns(
      instanceAsTable,
      flatAttributes,
      serviceInstance.rollback_attributes
    );
    service.embedded_entities.map((entity) => {
      const appendedEntities = appendEmbeddedEntity(
        graph,
        entity,
        (serviceInstance.rollback_attributes as InstanceAttributeModel)[
          entity.name
        ] as InstanceAttributeModel
      );
      connectEntities(graph, instanceAsTable, appendedEntities);
    });
  }
  //auto-layout provided by JointJS
  layout.DirectedGraph.layout(graph, {
    dagre: dagre,
    graphlib: graphlib,
    nodeSep: 80,
    edgeSep: 80,
    rankDir: "TB",
  });
}

/**
 * Function that creates, appends and returns created embedded entities which then are used to connects to it's parent
 * Supports recursion to display the whole tree
 *
 * @param {dia.Graph} graph JointJS Object on which we are appending given entity
 * @param {EmbeddedEntity} embeddedEntity that we want to display
 * @param {InstanceAttributeModel} entityAttributes - attributes of given entity
 * @returns {ServiceEntityBlock[]} created JointJS shapes
 */
export function appendEmbeddedEntity(
  graph: dia.Graph,
  embeddedEntity: EmbeddedEntity,
  entityAttributes: InstanceAttributeModel
): ServiceEntityBlock[] {
  //Create shape for Entity
  const createdInstances: ServiceEntityBlock[] = [];
  const flatAttributes = embeddedEntity.attributes.map(
    (attribute) => attribute.name
  );
  if (Array.isArray(entityAttributes)) {
    (entityAttributes as InstanceAttributeModel[]).map((entityInstance) => {
      const instanceAsTable = new ServiceEntityBlock()
        .setTabColor("#0066CC")
        .setName(embeddedEntity.name);
      appendColumns(instanceAsTable, flatAttributes, entityInstance);
      instanceAsTable.addTo(graph);
      createdInstances.push(instanceAsTable);
      embeddedEntity.embedded_entities.map((entity) => {
        const appendedEntity = appendEmbeddedEntity(
          graph,
          entity,
          entityInstance[entity.name] as InstanceAttributeModel
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
    instanceAsTable.addTo(graph);
    embeddedEntity.embedded_entities.map((entity) => {
      const appendedEntity = appendEmbeddedEntity(
        graph,
        entity,
        entityAttributes[entity.name] as InstanceAttributeModel
      );
      connectEntities(graph, instanceAsTable, appendedEntity);
    });
    return [instanceAsTable];
  }
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
  serviceInstanceAttributes: InstanceAttributeModel
) {
  serviceEntity.appendColumns(
    attributesKeywords.map((key) => {
      return {
        name: key,
        value: serviceInstanceAttributes[key] as string,
      };
    })
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
  targets: ServiceEntityBlock[]
) {
  targets.map((target) => {
    const link = new EntityConnection();
    link.source(source);
    link.target(target);
    link.addTo(graph);
  });
}
