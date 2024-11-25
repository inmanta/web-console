import { screen } from "@testing-library/react";
import { containerModel, testApiInstanceModel } from "../Mocks";
import {
  changeStencilElementAvailability,
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

describe("changeStencilElementAvailability", () => {
  const setup = (name: string, disabled: boolean) => {
    const elementsInfo = [
      [`body_${name}`, "stencil_accent-disabled"],
      [`bodyTwo_${name}`, "stencil_body-disabled"],
      [`text_${name}`, "stencil_text-disabled"],
    ];

    const elements = elementsInfo.map((element, index) => {
      const div = document.createElement("div");

      div.classList.add(element[0]);
      div.setAttribute("data-testid", `${name}-${index}`);

      if (disabled) {
        div.classList.add(element[1]);
      }

      return div;
    });

    document.body.append(...elements);
  };

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("disables the stencil elements", () => {
    setup("test", false);

    expect(screen.getByTestId("test-0")).not.toHaveClass(
      "stencil_accent-disabled",
    );
    expect(screen.getByTestId("test-1")).not.toHaveClass(
      "stencil_body-disabled",
    );
    expect(screen.getByTestId("test-2")).not.toHaveClass(
      "stencil_text-disabled",
    );

    changeStencilElementAvailability("test", "disable");

    expect(screen.getByTestId("test-0")).toHaveClass("stencil_accent-disabled");
    expect(screen.getByTestId("test-1")).toHaveClass("stencil_body-disabled");
    expect(screen.getByTestId("test-2")).toHaveClass("stencil_text-disabled");
  });

  it("enables the stencil elements", () => {
    setup("test", true);

    expect(screen.getByTestId("test-0")).toHaveClass("stencil_accent-disabled");
    expect(screen.getByTestId("test-1")).toHaveClass("stencil_body-disabled");
    expect(screen.getByTestId("test-2")).toHaveClass("stencil_text-disabled");

    changeStencilElementAvailability("test", "enable");

    expect(screen.getByTestId("test-0")).not.toHaveClass(
      "stencil_accent-disabled",
    );
    expect(screen.getByTestId("test-1")).not.toHaveClass(
      "stencil_body-disabled",
    );
    expect(screen.getByTestId("test-2")).not.toHaveClass(
      "stencil_text-disabled",
    );
  });

  it("if we try to enable the enabled stencil elements nothing happens", () => {
    setup("test", false);

    expect(screen.getByTestId("test-0")).not.toHaveClass(
      "stencil_accent-disabled",
    );
    expect(screen.getByTestId("test-1")).not.toHaveClass(
      "stencil_body-disabled",
    );
    expect(screen.getByTestId("test-2")).not.toHaveClass(
      "stencil_text-disabled",
    );

    changeStencilElementAvailability("test", "enable");

    expect(screen.getByTestId("test-0")).not.toHaveClass(
      "stencil_accent-disabled",
    );
    expect(screen.getByTestId("test-1")).not.toHaveClass(
      "stencil_body-disabled",
    );
    expect(screen.getByTestId("test-2")).not.toHaveClass(
      "stencil_text-disabled",
    );
  });

  it("if we try to disable the disabled stencil elements nothing happens", () => {
    setup("test", true);

    expect(screen.getByTestId("test-0")).toHaveClass("stencil_accent-disabled");
    expect(screen.getByTestId("test-1")).toHaveClass("stencil_body-disabled");
    expect(screen.getByTestId("test-2")).toHaveClass("stencil_text-disabled");

    changeStencilElementAvailability("test", "disable");

    expect(screen.getByTestId("test-0")).toHaveClass("stencil_accent-disabled");
    expect(screen.getByTestId("test-1")).toHaveClass("stencil_body-disabled");
    expect(screen.getByTestId("test-2")).toHaveClass("stencil_text-disabled");
  });
});
