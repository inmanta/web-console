import type { AttributeModel, ServiceModel } from "@/Core";
import { formatTreeRowData } from "./AttributeUtils";

function attribute(name: string, overrides: Partial<AttributeModel> = {}): AttributeModel {
  return {
    name,
    description: "description",
    modifier: "rw+",
    type: "string",
    default_value: null,
    default_value_set: false,
    validation_type: null,
    validation_parameters: null,
    ...overrides,
  } as AttributeModel;
}

function serviceModel(overrides: Partial<ServiceModel> = {}): Partial<ServiceModel> {
  return {
    attributes: [],
    embedded_entities: [],
    inter_service_relations: [],
    ...overrides,
  };
}

describe("formatTreeRowData: attaching the matching AttributeModel", () => {
  test("GIVEN a top-level attribute that matches the schema WHEN formatted THEN the node carries that AttributeModel", () => {
    const bandwidth = attribute("bandwidth", { type: "int" });
    const nodes = formatTreeRowData(
      { bandwidth: 150000 },
      serviceModel({ attributes: [bandwidth] })
    );

    expect(nodes[0].attribute).toBe(bandwidth);
  });

  test("GIVEN an instance value with no matching schema attribute WHEN formatted THEN the node has no attribute", () => {
    const nodes = formatTreeRowData({ orphan: "value" }, serviceModel());

    expect(nodes[0].attribute).toBeUndefined();
  });

  test("GIVEN an attribute nested inside a singular (non-list) embedded entity WHEN formatted THEN the node carries the embedded entity's own AttributeModel, not the parent's", () => {
    // Regression test: formatTreeRowData used to recurse into a singular embedded object with the
    // *parent* serviceModel, so a nested attribute name that coincidentally also existed at the
    // top level (like this "name" attribute does) would silently resolve to the wrong schema.
    const parentName = attribute("name", { description: "parent's own name attribute" });
    const embeddedName = attribute("name", { description: "site's own name attribute" });

    const model = serviceModel({
      attributes: [parentName],
      embedded_entities: [
        {
          name: "site",
          type: "site",
          description: null,
          modifier: "rw",
          lower_limit: 1,
          upper_limit: 1,
          attributes: [embeddedName],
          embedded_entities: [],
          inter_service_relations: [],
        },
      ],
    });

    const nodes = formatTreeRowData({ site: { name: "inmanta-lab" } }, model);
    const siteNode = nodes.find((node) => node.name === "site");
    const nameNode = siteNode?.children?.find((node) => node.name === "name");

    expect(nameNode?.attribute).toBe(embeddedName);
    expect(nameNode?.attribute).not.toBe(parentName);
  });

  test("GIVEN an attribute nested inside a list embedded entity WHEN formatted THEN the node carries the embedded entity's own AttributeModel", () => {
    const embeddedAttr = attribute("hostname");

    const model = serviceModel({
      embedded_entities: [
        {
          name: "nodes",
          type: "node",
          description: null,
          modifier: "rw",
          lower_limit: 0,
          attributes: [embeddedAttr],
          embedded_entities: [],
          inter_service_relations: [],
        },
      ],
    });

    const nodes = formatTreeRowData({ nodes: [{ hostname: "node-1" }] }, model);
    const listNode = nodes.find((node) => node.name === "nodes");
    const itemNode = listNode?.children?.[0];
    const hostnameNode = itemNode?.children?.find((node) => node.name === "hostname");

    expect(hostnameNode?.attribute).toBe(embeddedAttr);
  });
});
