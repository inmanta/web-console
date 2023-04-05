import { dia, linkTools } from "@clientio/rappid";
import { ServiceInstanceModel } from "@/Core";
import { Table } from "./shapes";

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

export function appendInstance(
  graph: dia.Graph,
  instance: ServiceInstanceModel,
  attibutesToDisplay: string[]
) {
  if (instance.active_attributes === null) {
    return;
  }
  const attrKeys = Object.keys(instance.active_attributes).filter(
    (key) =>
      key !== "name" && key !== "service_id" && attibutesToDisplay.includes(key)
  );

  const instanceAsTable = new Table()
    .setName(instance.service_entity.toUpperCase())
    .position(220, 220);

  instanceAsTable.appendColumns([
    { name: "name", value: instance.active_attributes.name as string },
    {
      name: "service_id",
      value: instance.active_attributes.service_id as string,
    },
    ...attrKeys.map((key) => {
      return {
        name: key,
        value:
          instance.active_attributes !== null
            ? (instance.active_attributes[key] as string)
            : "",
      };
    }),
  ]);

  instanceAsTable.addTo(graph);
}
