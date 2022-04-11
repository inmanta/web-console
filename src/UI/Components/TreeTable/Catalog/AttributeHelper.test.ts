import { CatalogAttributeHelper } from "./AttributeHelper";

test("AttributeHelper getPaths", () => {
  const attributeHelper = new CatalogAttributeHelper(".");
  const service = {
    attributes: [{ name: "e", type: "string", description: "" }],
    embedded_entities: [
      {
        name: "f",
        description: "description",
        attributes: [{ name: "g", type: "dict?", description: "sample" }],
        embedded_entities: [],
      },
      {
        name: "a",
        description: "",
        attributes: [{ name: "b", type: "int?", description: "desc" }],
        embedded_entities: [
          {
            name: "c",
            description: "desc",
            attributes: [{ name: "d", type: "int", description: "desc" }],
            embedded_entities: [],
          },
        ],
      },
    ],
  };
  const paths = attributeHelper.getPaths(service);

  expect(paths).toEqual(["a", "a.b", "a.c", "a.c.d", "e", "f", "f.g"]);
});

test("AttributeHelper getMultiAttributeNodes", () => {
  const attributeHelper = new CatalogAttributeHelper(".");
  const service = {
    attributes: [{ name: "e", type: "string", description: "" }],
    embedded_entities: [
      {
        name: "f",
        description: "description",
        attributes: [{ name: "g", type: "dict?", description: "sample" }],
        embedded_entities: [],
        inter_service_relations: [{ name: "h", entity_type: "test_service" }],
      },
      {
        name: "a",
        description: "",
        attributes: [{ name: "b", type: "int?", description: "desc" }],
        embedded_entities: [
          {
            name: "c",
            description: "desc",
            attributes: [{ name: "d", type: "int", description: "desc" }],
            embedded_entities: [],
          },
        ],
      },
    ],
  };
  const nodes = attributeHelper.getMultiAttributeNodes(service);

  expect(nodes).toEqual({
    a: { kind: "Branch" },
    "a.b": {
      kind: "Leaf",
      value: {
        type: "int?",
        description: "desc",
      },
    },
    "a.c": {
      kind: "Branch",
    },
    "a.c.d": {
      kind: "Leaf",
      value: {
        type: "int",
        description: "desc",
      },
    },
    e: {
      kind: "Leaf",
      value: {
        type: "string",
        description: "",
      },
    },
    f: { kind: "Branch" },
    "f.g": {
      kind: "Leaf",
      value: {
        type: "dict?",
        description: "sample",
      },
    },
    "f.h": {
      kind: "Leaf",
      value: {
        type: "test_service",
        description: "",
      },
      hasOnClick: true,
    },
  });
});
