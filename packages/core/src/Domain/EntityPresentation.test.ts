import { ServiceModel } from "@inmanta/web-console-core";
import * as Test from "@inmanta/web-console-test-utils";
import { compareEntityPresentations, resolveEntityPresentation } from "./EntityPresentation";

const service = Test.Service.a;
const { presentationAnnotations } = Test.Service.EntityPresentation;

const serviceWith = (annotations: Record<string, unknown>): ServiceModel => ({
  ...service,
  entity_annotations: annotations,
});

describe("resolveEntityPresentation", () => {
  it("uses the annotations when they are present", () => {
    expect(resolveEntityPresentation(serviceWith({ ...presentationAnnotations }))).toEqual(
      presentationAnnotations
    );
  });

  it("falls back to the entity name and description when the annotations are missing", () => {
    expect(resolveEntityPresentation(service)).toEqual({
      web_title: service.name,
      web_icon: undefined,
      web_group: undefined,
      web_order: undefined,
      web_description: service.description,
    });
  });

  it("falls back when an annotation has the wrong type or is empty", () => {
    const presentation = resolveEntityPresentation(
      serviceWith({
        web_title: 42,
        web_icon: "",
        web_group: ["Network"],
        web_order: "2",
        web_description: "  ",
      })
    );

    expect(presentation).toEqual({
      web_title: service.name,
      web_icon: undefined,
      web_group: undefined,
      web_order: undefined,
      web_description: service.description,
    });
  });

  it("trims the annotation strings", () => {
    const presentation = resolveEntityPresentation(
      serviceWith({ web_title: ` ${presentationAnnotations.web_title} ` })
    );

    expect(presentation.web_title).toBe(presentationAnnotations.web_title);
  });

  it("ignores a web_order that is not a finite number", () => {
    expect(resolveEntityPresentation(serviceWith({ web_order: NaN })).web_order).toBeUndefined();
  });

  it("has no description when neither web_description nor description is set", () => {
    expect(
      resolveEntityPresentation({ ...service, description: null }).web_description
    ).toBeUndefined();
  });
});

describe("compareEntityPresentations", () => {
  it("sorts by order, puts services without an order last and breaks ties on title", () => {
    const presentations = [
      { web_title: "Delta" },
      { web_title: "Charlie", web_order: 2 },
      { web_title: "Bravo" },
      { web_title: "Alpha", web_order: 2 },
      { web_title: "Echo", web_order: 1 },
    ];

    expect(
      [...presentations].sort(compareEntityPresentations).map(({ web_title }) => web_title)
    ).toEqual(["Echo", "Alpha", "Charlie", "Bravo", "Delta"]);
  });
});
