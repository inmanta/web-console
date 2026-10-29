import { ServiceModel } from "@inmanta/web-console-core";
import * as Test from "@inmanta/web-console-test-utils";
import { compareEntityAnnotations, resolveEntityAnnotations } from "./EntityAnnotations";

const service = Test.Service.a;
const validAnnotations = Test.Service.EntityAnnotations.valid;

const serviceWith = (annotations: Record<string, unknown>): ServiceModel => ({
  ...service,
  entity_annotations: annotations,
});

describe("resolveEntityAnnotations", () => {
  it("uses the annotations when they are present", () => {
    expect(resolveEntityAnnotations(serviceWith({ ...validAnnotations }))).toEqual(
      validAnnotations
    );
  });

  it("falls back to the entity name and description when the annotations are missing", () => {
    expect(resolveEntityAnnotations(service)).toEqual({
      web_title: service.name,
      web_icon: undefined,
      web_group: undefined,
      web_order: undefined,
      web_description: service.description,
    });
  });

  it("falls back when an annotation has the wrong type or is empty", () => {
    const resolvedAnnotations = resolveEntityAnnotations(
      serviceWith({
        web_title: 42,
        web_icon: "",
        web_group: ["Network"],
        web_order: "2",
        web_description: "  ",
      })
    );

    expect(resolvedAnnotations).toEqual({
      web_title: service.name,
      web_icon: undefined,
      web_group: undefined,
      web_order: undefined,
      web_description: service.description,
    });
  });

  it("trims the annotation strings", () => {
    const resolvedAnnotations = resolveEntityAnnotations(
      serviceWith({ web_title: ` ${validAnnotations.web_title} ` })
    );

    expect(resolvedAnnotations.web_title).toBe(validAnnotations.web_title);
  });

  it("ignores a web_order that is not a finite number", () => {
    expect(resolveEntityAnnotations(serviceWith({ web_order: NaN })).web_order).toBeUndefined();
  });

  it("has no description when neither web_description nor description is set", () => {
    expect(
      resolveEntityAnnotations({ ...service, description: null }).web_description
    ).toBeUndefined();
  });
});

describe("compareEntityAnnotations", () => {
  it("sorts by order, puts services without an order last and breaks ties on title", () => {
    const resolvedAnnotationsList = [
      { web_title: "Delta" },
      { web_title: "Charlie", web_order: 2 },
      { web_title: "Bravo" },
      { web_title: "Alpha", web_order: 2 },
      { web_title: "Echo", web_order: 1 },
    ];

    expect(
      [...resolvedAnnotationsList].sort(compareEntityAnnotations).map(({ web_title }) => web_title)
    ).toEqual(["Echo", "Alpha", "Charlie", "Bravo", "Delta"]);
  });
});
