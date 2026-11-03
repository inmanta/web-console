import { Service } from "@inmanta/web-console-test-utils";
import { createStencilGroups } from "./createStencilGroups";

/** Returns the text a stencil group label shows. */
const getLabelText = (label: string | HTMLElement): string | null =>
  typeof label === "string" ? label : label.textContent;

describe("createStencilGroups", () => {
  const serviceWithTitle = {
    ...Service.a,
    entity_annotations: { ...Service.EntityAnnotations.valid },
  };

  it("labels each group by the web_title of its service, or its name, in the given order", () => {
    const serviceNames = [Service.b.name, Service.a.name, "missing_service"];
    const stencilGroups = createStencilGroups(serviceNames, [serviceWithTitle, Service.b]);

    expect(
      serviceNames.map((serviceName) => ({
        index: stencilGroups[serviceName].index,
        label: getLabelText(stencilGroups[serviceName].label),
      }))
    ).toEqual([
      { index: 0, label: Service.b.name },
      { index: 1, label: Service.EntityAnnotations.valid.web_title },
      { index: 2, label: "missing_service" },
    ]);
  });

  it("keeps HTML in a web_title as plain text", () => {
    const serviceWithMarkup = { ...Service.a, entity_annotations: { web_title: "<b>A & B</b>" } };
    const { label } = createStencilGroups([Service.a.name], [serviceWithMarkup])[Service.a.name];

    expect(getLabelText(label)).toEqual("<b>A & B</b>");
    expect(label instanceof HTMLElement && label.querySelector("b")).toBeFalsy();
  });
});
