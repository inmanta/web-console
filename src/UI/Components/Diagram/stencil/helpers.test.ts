import { containerModel, testApiInstanceModel } from "../Mocks";
import {
  createStencilElement,
  transformEmbeddedToStencilElements,
} from "./helpers";

const defaultStencil = {
  type: "standard.Path",
  size: { width: 240, height: 40 },
  name: "default",
  holderName: undefined,
  disabled: false,
  instanceAttributes: undefined,
  serviceModel: undefined,
  id: "1",
  attrs: {
    body: {
      width: 7,
      height: 40,
      x: 233,
      fill: "#6753AC",
      stroke: "none",
      class: "default_body",
    },
    bodyTwo: {
      width: 240,
      height: 40,
      fill: "#FFFFFF",
      stroke: "none",
      class: "default_bodyTwo",
    },
    label: {
      refX: null,
      x: "10",
      textAnchor: "start",
      fontFamily: "sans-serif",
      fontSize: 12,
      text: "default",
      class: "default_text",
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

    expect(defaultElement).toStrictEqual(defaultStencil);

    const embeddedElementWithModel = createStencilElement(
      "default",
      containerModel.embedded_entities[0],
      {
        attrOne: "test_value",
        attrTwo: "other_test_value",
      },
      true,
      "holderName",
    );

    expect(embeddedElementWithModel).toStrictEqual({
      ...defaultStencil,
      id: "2",
      serviceModel: containerModel.embedded_entities[0],
      holderName: "holderName",
      instanceAttributes: {
        attrOne: "test_value",
        attrTwo: "other_test_value",
      },
      attrs: {
        ...defaultStencil.attrs,
        body: { ...defaultStencil.attrs.body, fill: "#0066cc" },
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
        ...defaultStencil,
        name: "embedded",
        id: "3",
        serviceModel: {
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
          ...defaultStencil.attrs,
          body: {
            ...defaultStencil.attrs.body,
            fill: "#0066cc",
            class: "embedded_body",
          },
          bodyTwo: {
            ...defaultStencil.attrs.bodyTwo,
            fill: "#FFFFFF",
            class: "embedded_bodyTwo",
          },
          label: {
            ...defaultStencil.attrs.label,
            text: "embedded",
            class: "embedded_text",
          },
        },
      },
      {
        ...defaultStencil,
        name: "embedded-embedded",
        id: "4",
        serviceModel: {
          ...containerModel.embedded_entities[0],
          name: "embedded-embedded",
        },
        holderName: "embedded",
        attrs: {
          ...defaultStencil.attrs,
          body: {
            ...defaultStencil.attrs.body,
            fill: "#0066cc",
            class: "embedded-embedded_body",
          },
          bodyTwo: {
            ...defaultStencil.attrs.bodyTwo,
            fill: "#FFFFFF",
            class: "embedded-embedded_bodyTwo",
          },
          label: {
            ...defaultStencil.attrs.label,
            text: "embedded-embedded",
            class: "embedded-embedded_text",
          },
        },
      },
    ]);
  });
});
