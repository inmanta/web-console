import { screen } from "@testing-library/react";
import { containerModel, testApiInstanceModel } from "../Mocks";
import {
  toggleDisabledStencil,
  createStencilElement,
  transformEmbeddedToStencilElements,
} from "./helpers";

describe("createStencilElement", () => {
  it("returns single instance of Stencil Element based on properties passed", () => {
    const embeddedElementWithModel = createStencilElement(
      "default",
      containerModel.embedded_entities[0],
      {
        id: "123",
        attrOne: "test_value",
        attrTwo: "other_test_value",
      },
      true,
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
      id: "123",
    });

    expect(embeddedElementWithModel.attributes.attrs?.body?.fill).toEqual(
      "var(--pf-t--chart--color--blue--400, #004d99)",
    );
    expect(
      embeddedElementWithModel.attributes.attrs?.body?.["aria-labelledby"],
    ).toEqual("body_default");

    expect(embeddedElementWithModel.attributes.attrs?.bodyTwo?.fill).toEqual(
      "var(--pf-t--global--background--color--primary--default)",
    );
    expect(
      embeddedElementWithModel.attributes.attrs?.bodyTwo?.["aria-labelledby"],
    ).toEqual("bodyTwo_default");

    expect(
      embeddedElementWithModel.attributes.attrs?.label?.["aria-labelledby"],
    ).toEqual("text_default");
    expect(
      embeddedElementWithModel.attributes.attrs?.borderTop?.height,
    ).toEqual(1);

    //check difference with body fill for non-embedded
    const nonEmbedded = createStencilElement("nonEmbedded", containerModel, {
      attrOne: "test_value",
      attrTwo: "other_test_value",
    });

    expect(nonEmbedded.attributes.attrs?.body?.fill).toEqual(
      "var(--pf-t--chart--color--purple--300, #5e40be)",
    );
    expect(nonEmbedded.attributes.attrs?.body?.["aria-labelledby"]).toEqual(
      "body_nonEmbedded",
    );
    expect(nonEmbedded.attributes.attrs?.borderTop?.height).toEqual(0);
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

describe("toggleDisabledStencil", () => {
  const setup = (name: string, disabled: boolean) => {
    const elementsInfo = [
      [`body_${name}`, "stencil_accent-disabled"],
      [`bodyTwo_${name}`, "stencil_body-disabled"],
      [`text_${name}`, "stencil_text-disabled"],
    ];

    const elements = elementsInfo.map((element, index) => {
      const div = document.createElement("div");

      div.setAttribute("data-testid", `${name}-${index}`);
      div.setAttribute("aria-labelledby", element[0]);

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

  it("without force set it toggles the stencil elements", () => {
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

    toggleDisabledStencil("test");

    expect(screen.getByTestId("test-0")).toHaveClass("stencil_accent-disabled");
    expect(screen.getByTestId("test-1")).toHaveClass("stencil_body-disabled");
    expect(screen.getByTestId("test-2")).toHaveClass("stencil_text-disabled");

    toggleDisabledStencil("test");

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

  it("with force set to false it disables the stencil elements", () => {
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

    toggleDisabledStencil("test", true);

    expect(screen.getByTestId("test-0")).toHaveClass("stencil_accent-disabled");
    expect(screen.getByTestId("test-1")).toHaveClass("stencil_body-disabled");
    expect(screen.getByTestId("test-2")).toHaveClass("stencil_text-disabled");
  });

  it("with force set to true it enables the stencil elements", () => {
    setup("test", true);

    expect(screen.getByTestId("test-0")).toHaveClass("stencil_accent-disabled");
    expect(screen.getByTestId("test-1")).toHaveClass("stencil_body-disabled");
    expect(screen.getByTestId("test-2")).toHaveClass("stencil_text-disabled");

    toggleDisabledStencil("test", false);

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

  it("with force set to false if we try to enable the enabled stencil elements nothing happens", () => {
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

    toggleDisabledStencil("test", false);

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

  it("with force set to true if we try to disable the disabled stencil elements nothing happens", () => {
    setup("test", true);

    expect(screen.getByTestId("test-0")).toHaveClass("stencil_accent-disabled");
    expect(screen.getByTestId("test-1")).toHaveClass("stencil_body-disabled");
    expect(screen.getByTestId("test-2")).toHaveClass("stencil_text-disabled");

    toggleDisabledStencil("test", true);

    expect(screen.getByTestId("test-0")).toHaveClass("stencil_accent-disabled");
    expect(screen.getByTestId("test-1")).toHaveClass("stencil_body-disabled");
    expect(screen.getByTestId("test-2")).toHaveClass("stencil_text-disabled");
  });
});
