import { dia, linkTools } from "@clientio/rappid";
import { ServiceInstanceModel } from "@/Core";
import { ServiceEntityBlock } from "./shapes";

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
 * @param graph JointJS Object on which we are appending given instance
 * @param instance instance that we want to display
 * @param attibutesToDisplay attributes which we want to display as instance Object doesn't differentiate core attributes from i.e. embedded entities
 * @returns void
 */
export function appendInstance(
  graph: dia.Graph,
  serviceInstance: ServiceInstanceModel,
  serviceAttributes: string[]
) {
  if (serviceInstance.active_attributes === null) {
    return;
  }
  const instanceAsTable = new ServiceEntityBlock()
    .setName(serviceInstance.service_entity.toUpperCase())
    .position(220, 220);

  instanceAsTable.appendColumns(
    serviceAttributes.map((key) => {
      return {
        name: key,
        value:
          serviceInstance.active_attributes !== null
            ? (serviceInstance.active_attributes[key] as string)
            : "",
      };
    })
  );

  instanceAsTable.addTo(graph);
}
