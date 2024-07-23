import { containerModel, testApiInstanceModel } from "../Mock";
import {
  createStencilElement,
  transformEmbeddedToStencilElements,
} from "./helpers";

const stencilBlueprint = {
  type: "standard.Path",
  size: { width: 240, height: 40 },
  name: "default",
  entity_model: undefined,
  holderName: undefined,
  disabled: false,
  attrs: {
    body: {
      width: 7,
      height: 40,
      x: 233,
      fill: "#6753AC",
      stroke: "none",
    },
    bodyTwo: {
      width: 240,
      height: 40,
      fill: "#fff",
      stroke: "none",
    },
    label: {
      refX: null,
      x: "10",
      textAnchor: "start",
      fontFamily: "sans-serif",
      fontSize: 12,
      text: "default",
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
  ],
};

describe("createStencilElement", () => {
  it("returns proper Stencil Elements based on properties passed", () => {
    const defaultElement = createStencilElement("default");
    expect(defaultElement).toStrictEqual(stencilBlueprint);

    const embeddedElementWithModel = createStencilElement(
      "default",
      containerModel.embedded_entities[0],
      true,
      "holderName",
    );
    expect(embeddedElementWithModel).toStrictEqual({
      ...stencilBlueprint,
      entity_model: containerModel.embedded_entities[0],
      holderName: "holderName",
      attrs: {
        ...stencilBlueprint.attrs,
        body: { ...stencilBlueprint.attrs.body, fill: "#06c" },
      },
    });
  });
});

describe("transformEmbeddedToStencilElements", () => {
  it("returns proper Stencil Elements based on the Service Model passed", () => {
    const result = transformEmbeddedToStencilElements({
      ...testApiInstanceModel,
      name: "holderName",
      embedded_entities: [
        {
          ...containerModel.embedded_entities[0],
          name: "embedded",
          embedded_entities: [
            {
              ...containerModel.embedded_entities[0],
              name: "embedded-embedded",
            },
          ],
        },
      ],
    });

    expect(result).toStrictEqual([
      {
        ...stencilBlueprint,
        name: "embedded",

        entity_model: {
          ...containerModel.embedded_entities[0],
          name: "embedded",
          embedded_entities: [
            {
              ...containerModel.embedded_entities[0],
              name: "embedded-embedded",
            },
          ],
        },
        holderName: "holderName",
        attrs: {
          ...stencilBlueprint.attrs,
          body: { ...stencilBlueprint.attrs.body, fill: "#06c" },
          label: { ...stencilBlueprint.attrs.label, text: "embedded" },
        },
      },
      {
        ...stencilBlueprint,
        name: "embedded-embedded",
        entity_model: {
          ...containerModel.embedded_entities[0],
          name: "embedded-embedded",
        },
        holderName: "embedded",
        attrs: {
          ...stencilBlueprint.attrs,
          body: { ...stencilBlueprint.attrs.body, fill: "#06c" },
          label: { ...stencilBlueprint.attrs.label, text: "embedded-embedded" },
        },
      },
    ]);
  });
});
