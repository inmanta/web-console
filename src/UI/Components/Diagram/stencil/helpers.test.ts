import { containerModel, testApiInstanceModel } from "../Mocks";
import {
  createStencilElement,
  transformEmbeddedToStencilElements,
} from "./helpers";

describe("createStencilElement", () => {
  it("returns single instance of Stencil Element based on properties passed", () => {
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

    expect(embeddedElementWithModel.attributes.name).toEqual("default");
    expect(embeddedElementWithModel.attributes.serviceModel).toStrictEqual(
      containerModel.embedded_entities[0],
    );
    expect(embeddedElementWithModel.attributes.holderName).toEqual(
      "holderName",
    );
    expect(
      embeddedElementWithModel.attributes.instanceAttributes,
    ).toStrictEqual({
      attrOne: "test_value",
      attrTwo: "other_test_value",
    });
    expect(embeddedElementWithModel.attributes.attrs?.body).toStrictEqual({
      width: 7,
      height: 40,
      x: 233,
      d: "M 0 0 H calc(w) V calc(h) H 0 Z",
      strokeWidth: 2,
      fill: "var(--pf-v5-global--palette--blue-400)",
      stroke: "none",
      class: "body_default",
    });
    expect(embeddedElementWithModel.attributes.attrs?.bodyTwo).toStrictEqual({
      width: 240,
      height: 40,
      fill: "var(--pf-v5-global--palette--white)",
      stroke: "none",
      class: "bodyTwo_default",
    });
    expect(embeddedElementWithModel.attributes.attrs?.label).toStrictEqual({
      x: "10",
      textAnchor: "start",
      fontFamily: "sans-serif",
      fontSize: 12,
      text: "default",
      refX: undefined,
      class: "text_default",
      y: "calc(h/2)",
      textVerticalAnchor: "middle",
      fill: "#333333",
    });
  });
});

describe("transformEmbeddedToStencilElements", () => {
  it("returns all Stencil Elements based on the Service Model passed", () => {
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

    expect(result.length).toEqual(2);
    expect(result[0].attributes.name).toEqual("embedded");
    expect(result[0].attributes.serviceModel).toStrictEqual({
      ...containerModel.embedded_entities[0],
      name: "embedded",
      embedded_entities: [
        {
          ...containerModel.embedded_entities[0],
          name: "embedded-embedded",
        },
      ],
    });
    expect(result[0].attributes.holderName).toEqual("holderName");
    expect(result[0].attributes.instanceAttributes).toStrictEqual({});

    expect(result[1].attributes.name).toEqual("embedded-embedded");
    expect(result[1].attributes.serviceModel).toStrictEqual({
      ...containerModel.embedded_entities[0],
      name: "embedded-embedded",
    });
    expect(result[1].attributes.holderName).toEqual("embedded");
    expect(result[1].attributes.instanceAttributes).toStrictEqual({});
  });
});
