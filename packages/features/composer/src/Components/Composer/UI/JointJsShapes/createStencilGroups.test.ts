import { Service } from "@inmanta/web-console-test-utils";
import { createStencilGroups } from "./createStencilGroups";

describe("createStencilGroups", () => {
  it("labels each group by the web_title of its service, or its name, in the given order", () => {
    const serviceWithTitle = {
      ...Service.a,
      entity_annotations: { ...Service.EntityAnnotations.valid },
    };
    const serviceNames = [Service.b.name, Service.a.name, "missing_service"];

    expect(createStencilGroups(serviceNames, [serviceWithTitle, Service.b])).toEqual({
      [Service.b.name]: { index: 0, label: Service.b.name },
      [Service.a.name]: { index: 1, label: Service.EntityAnnotations.valid.web_title },
      missing_service: { index: 2, label: "missing_service" },
    });
  });
});
