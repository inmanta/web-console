import { shapes } from "@inmanta/rappid";
import { HeaderColors, ServiceEntityBase } from "../ServiceEntityShape";
import { t_global_background_color_primary_default, t_global_border_color_200, t_global_font_size_body_default, t_global_text_color_regular } from "@patternfly/react-tokens";
import { v4 as uuidv4 } from 'uuid';

export interface SidebarItemOptions extends ServiceEntityBase {
  isDisabled: boolean;
  index: number;
}

export const createSidebarItem = (options: SidebarItemOptions) => {
  const name = ('type' in options.serviceModel && options.serviceModel.type)
    ? options.serviceModel.type
    : options.serviceModel.name;

  const id = options.id || uuidv4();

  return new shapes.standard.Path({
    type: "standard.Path",
    size: { width: 240, height: 40 },
    name: name,
    serviceModel: options.serviceModel,
    attributes: options.instanceAttributes,
    embeddedEntities: options.embeddedEntities,
    interServiceRelations: options.interServiceRelations,
    rootEntities: options.rootEntities,
    disabled: options.isDisabled,
    id: id,
    attrs: {
      // This is the colored line preceding the menu-item.
      body: {
        "aria-labelledby": "body_" + name,
        width: 7,
        height: 40,
        fill: HeaderColors[options.entityType],
        stroke: "none",
        className: options.isDisabled ? "stencil_accent-disabled" : "",
      },
      bodyTwo: {
        "aria-labelledby": "bodyTwo_" + name,
        width: 240,
        height: 40,
        x: 10,
        fill: t_global_background_color_primary_default.var,
        stroke: "none",
        className: options.isDisabled ? "stencil_body-disabled" : "",
      },
      label: {
        "aria-labelledby": "text_" + name,
        refX: undefined, // reset the default
        x: 15,
        textAnchor: "start",
        fontFamily: "sans-serif",
        fontSize: t_global_font_size_body_default.var,
        text: name,
        fill: t_global_text_color_regular.var,
        className: options.isDisabled ? "stencil_text-disabled" : "",
      },
      borderBottom: {
        width: 240,
        height: 1,
        x: 0,
        y: 39,
        fill: t_global_border_color_200.var,
        stroke: "none",
      },
      borderTop: {
        width: 240,
        height: options.index === 0 ? 1 : 0, // only show the top border for the first item
        x: 0,
        y: 0,
        fill: t_global_border_color_200.var,
        stroke: "none",
      },
    },
    markup: [
      {
        tagName: "rect",
        selector: "bodyTwo",
      },
      {
        tagName: "rect",
        selector: "body",
      },
      {
        tagName: "text",
        selector: "label",
      },
      {
        tagName: "rect",
        selector: "borderBottom",
      },
      {
        tagName: "rect",
        selector: "borderTop",
      },
    ],
  });
};