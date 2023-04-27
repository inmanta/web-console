import { dia, elementTools, g, layout, linkTools } from "@inmanta/rappid";
import dagre, { graphlib } from "dagre";
import {
  AttributeModel,
  EmbeddedEntity,
  InstanceAttributeModel,
  ServiceInstanceModel,
  ServiceModel,
} from "@/Core";
import { DictDialogData } from "./interfaces";
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
 * Function to conditionally display the info icon that displays dictionary values in the modal
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.LinkView
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#linkTools
 *
 * @param {dia.LinkView} elementView  - The view for the joint.dia.Link model.
 * @param {AttributeModel[]} serviceAttributes  - The view for the joint.dia.Link model.
 * @param {InstanceAttributeModel} serviceInstance  - The view for the joint.dia.Link model.
 * @returns {void}
 */
export function appendInfoTool(
  elementView: dia.CellView,
  serviceAttributes: AttributeModel[],
  serviceInstance: InstanceAttributeModel
) {
  const tools: dia.ToolView[] = [];

  //search for any dictionary attributes
  const dictionaries = serviceAttributes
    .filter((attributeDef) => attributeDef.type.includes("dict"))
    .map((dictionaryAttr) => dictionaryAttr.name);

  if (!dictionaries.length) {
    return;
  }

  //if they are then create and add infoButton and append it to the view
  const dictionariesButton = new elementTools.Button({
    markup: [
      {
        tagName: "circle",
        selector: "button",
        attributes: {
          r: 7,
          fill: "#8A8D90",
          cursor: "pointer",
        },
      },
      {
        tagName: "path",
        selector: "icon",
        attributes: {
          d: "M -2 4 2 4 M 0 3 0 0 M -2 -1 1 -1 M -1 -4 1 -4",
          fill: "none",
          stroke: "#FFFFFF",
          "stroke-width": 2,
          "pointer-events": "none",
        },
      },
    ],
    x: "90%",
    y: "11%",
    offset: {
      x: 0,
      y: 0,
    },
    rotate: true,
    action: function () {
      const stringifiedDicts: DictDialogData[] = dictionaries.map((keyword) => {
        return {
          title: keyword,
          value: JSON.stringify(serviceInstance[keyword], null, 2),
        };
      });
      document.dispatchEvent(
        new CustomEvent("openDictsModal", { detail: stringifiedDicts })
      );
    },
  });
  tools.push(dictionariesButton);

  const toolsView = new dia.ToolsView({
    tools,
  });
  elementView.addTools(toolsView);
}

/**
 * This function converts Instance attributes to display them on the Smart Service Composer canvas.
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.Graph
 *
 * @param {dia.Paper} paper JointJS Object on which we are appending given instance
 * @param {dia.Graph} graph JointJS Object on which we are appending given instance
 * @param {ServiceInstanceModel} serviceInstance that we want to display
 * @param {ServiceModel} service that hold definitions for attributes which we want to display as instance Object doesn't differentiate core attributes from i.e. embedded entities
 * @returns {g.Rect} coordinates that are being use to center view as regular behavior center to the last entity added
 */
export function appendInstance(
  paper: dia.Paper,
  graph: dia.Graph,
  serviceInstance: ServiceInstanceModel,
  service: ServiceModel
): g.Rect {
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

    //add to graph and then check for dictionaries
    instanceAsTable.addTo(graph);
    appendInfoTool(
      instanceAsTable.findView(paper),
      service.attributes,
      serviceInstance.active_attributes
    );

    //iterate through embedded entities to create and connect them
    service.embedded_entities.map((entity) => {
      const appendedEntity = appendEmbeddedEntity(
        paper,
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

    //add to graph and then check for dictionaries
    instanceAsTable.addTo(graph);
    appendInfoTool(
      instanceAsTable.findView(paper),
      service.attributes,
      serviceInstance.candidate_attributes
    );

    //iterate through embedded entities to create and connect them
    service.embedded_entities.map((entity) => {
      const appendedEntity = appendEmbeddedEntity(
        paper,
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

    //add to graph and then check for dictionaries
    instanceAsTable.addTo(graph);
    appendInfoTool(
      instanceAsTable.findView(paper),
      service.attributes,
      serviceInstance.rollback_attributes
    );

    //iterate through embedded entities to create and connect them
    service.embedded_entities.map((entity) => {
      const appendedEntities = appendEmbeddedEntity(
        paper,
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
  return instanceAsTable.getBBox();
}

/**
 * Function that creates, appends and returns created embedded entities which then are used to connects to it's parent
 * Supports recursion to display the whole tree
 *
 * @param {dia.Paper} paper JointJS Object on which we are appending given instance
 * @param {dia.Graph} graph JointJS Object on which we are appending given entity
 * @param {EmbeddedEntity} embeddedEntity that we want to display
 * @param {InstanceAttributeModel} entityAttributes - attributes of given entity
 * @returns {ServiceEntityBlock[]} created JointJS shapes
 */
export function appendEmbeddedEntity(
  paper: dia.Paper,
  graph: dia.Graph,
  embeddedEntity: EmbeddedEntity,
  entityAttributes: InstanceAttributeModel
): ServiceEntityBlock[] {
  //Create shape for Entity
  const flatAttributes = embeddedEntity.attributes.map(
    (attribute) => attribute.name
  );

  if (Array.isArray(entityAttributes)) {
    const createdInstances: ServiceEntityBlock[] = [];

    (entityAttributes as InstanceAttributeModel[]).map((entityInstance) => {
      const instanceAsTable = new ServiceEntityBlock()
        .setTabColor("#0066CC")
        .setName(embeddedEntity.name);

      appendColumns(instanceAsTable, flatAttributes, entityInstance);

      //add to graph and then check for dictionaries
      instanceAsTable.addTo(graph);
      appendInfoTool(
        instanceAsTable.findView(paper),
        embeddedEntity.attributes,
        entityInstance
      );

      createdInstances.push(instanceAsTable);

      //iterate through embedded entities to create and connect them
      embeddedEntity.embedded_entities.map((entity) => {
        const appendedEntity = appendEmbeddedEntity(
          paper,
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

    //add to graph and then check for dictionaries
    instanceAsTable.addTo(graph);
    appendInfoTool(
      instanceAsTable.findView(paper),
      embeddedEntity.attributes,
      entityAttributes
    );

    //iterate through embedded entities to create and connect them
    embeddedEntity.embedded_entities.map((entity) => {
      const appendedEntity = appendEmbeddedEntity(
        paper,
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
