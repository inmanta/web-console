import { ServiceModel } from "@/Core";
import { Service } from "@/Test";
import {
  InventoryAttributeHelper,
  getValue,
  isLeaf,
  isMultiLeaf,
} from "./AttributeHelper";

test("AttributeHelper getPaths", () => {
  const attributeHelper = new InventoryAttributeHelper(".");
  const attributes = {
    candidate: null,
    active: {
      a: {
        b: {
          c: "d",
        },
      },
      e: "f",
      g: {
        h: "i",
      },
    },
    rollback: null,
  };
  const paths = attributeHelper.getPaths(attributes);

  expect(paths).toEqual(["a", "a.b", "a.b.c", "e", "g", "g.h"]);
});

test("AttributeHelper getPaths sorts paths", () => {
  const attributeHelper = new InventoryAttributeHelper(".");
  const attributes = {
    candidate: null,
    active: {
      g: {
        h: "i",
      },
      e: "f",
      a: {
        b: {
          c: "d",
        },
      },
    },
    rollback: null,
  };
  const paths = attributeHelper.getPaths(attributes);

  expect(paths).toEqual(["a", "a.b", "a.b.c", "e", "g", "g.h"]);
});

test("AttributeHelper getMultiAttributeNodes", () => {
  const attributeHelper = new InventoryAttributeHelper(".");
  const attributes = {
    candidate: null,
    active: {
      a: {
        b: {
          c: "d",
        },
      },
      e: "f",
      g: {
        h: "i",
      },
    },
    rollback: null,
  };
  const nodes = attributeHelper.getMultiAttributeNodes(attributes);

  expect(nodes).toEqual({
    a: { kind: "Branch" },
    "a.b": { kind: "Branch" },
    "a.b.c": {
      entity: undefined,
      hasRelation: undefined,
      kind: "Leaf",
      type: undefined,
      value: {
        active: "d",
        candidate: undefined,
        rollback: undefined,
      },
    },
    e: {
      entity: undefined,
      hasRelation: undefined,
      kind: "Leaf",
      type: undefined,
      value: {
        active: "f",
        candidate: undefined,
        rollback: undefined,
      },
    },
    g: { kind: "Branch" },
    "g.h": {
      entity: undefined,
      hasRelation: undefined,
      kind: "Leaf",
      type: undefined,
      value: {
        active: "i",
        candidate: undefined,
        rollback: undefined,
      },
    },
  });
});

test("isLeaf returns true for undefined", () => {
  expect(isLeaf(undefined)).toBeTruthy();
});

test("isLeaf returns true for Leaf", () => {
  expect(isLeaf({ kind: "Leaf", value: null })).toBeTruthy();
});

test("isLeaf returns false for Branch", () => {
  expect(isLeaf({ kind: "Branch" })).toBeFalsy();
});

test("getValue returns undefined for undefined", () => {
  expect(getValue(undefined)).toBeUndefined();
});

test("getValue returns value for Leaf", () => {
  expect(getValue({ kind: "Leaf", value: "123" })).toEqual("123");
});

test("getValue returns undefined for Branch", () => {
  expect(getValue({ kind: "Branch" })).toBeUndefined();
});

test("isMultiLeaf returns true for 1 Leaf", () => {
  expect(
    isMultiLeaf(undefined, { kind: "Leaf", value: null }, undefined)
  ).toBeTruthy();
});

test("isMultiLeaf returns false for (undefined,Branch,undefined)", () => {
  expect(isMultiLeaf(undefined, { kind: "Branch" }, undefined)).toBeFalsy();
});

test("isMultiLeaf returns true for (undefined,undefined,undefined)", () => {
  expect(isMultiLeaf(undefined, undefined, undefined)).toBeTruthy();
});

test("isMultiLeaf returns false for Leaf Leaf Branch", () => {
  expect(
    isMultiLeaf(
      { kind: "Leaf", value: null },
      { kind: "Leaf", value: null },
      { kind: "Branch" }
    )
  ).toBeFalsy();
});

test("isMultiLeaf returns true for Leaf Leaf Leaf", () => {
  expect(
    isMultiLeaf(
      { kind: "Leaf", value: null },
      { kind: "Leaf", value: null },
      { kind: "Leaf", value: null }
    )
  ).toBeTruthy();
});

test("AttributeHelper extracts inter-service relations correctly", () => {
  const service: ServiceModel = {
    ...Service.a,
    attributes: [
      {
        name: "id_attr",
        description: "desc",
        modifier: "rw",
        type: "string",
        default_value: null,
        default_value_set: false,
        validation_type: null,
        validation_parameters: null,
      },
    ],
    embedded_entities: [
      {
        name: "embedded",
        modifier: "rw",
        lower_limit: 0,
        upper_limit: 2,
        attributes: [
          {
            name: "attr",
            modifier: "rw",
            type: "string?",
            default_value: null,
            default_value_set: false,
            validation_type: null,
            validation_parameters: null,
          },
        ],
        embedded_entities: [
          {
            name: "embedded",
            modifier: "rw",
            lower_limit: 0,
            upper_limit: 2,
            attributes: [
              {
                name: "attr",
                modifier: "rw",
                type: "string?",
                default_value: null,
                default_value_set: false,
                validation_type: null,
                validation_parameters: null,
              },
            ],
            embedded_entities: [],
            inter_service_relations: [
              {
                name: "test",
                modifier: "rw+",
                lower_limit: 0,
                upper_limit: 5,
                entity_type: "type2",
              },
            ],
          },
        ],
        inter_service_relations: [
          {
            name: "test",

            modifier: "rw+",
            lower_limit: 0,
            upper_limit: 5,
            entity_type: "type1",
          },
        ],
      },
      {
        name: "embedded2",
        modifier: "rw",
        lower_limit: 0,
        upper_limit: 2,
        attributes: [
          {
            name: "attr_xyz",
            modifier: "rw",
            type: "string?",
            default_value: null,
            default_value_set: false,
            validation_type: null,
            validation_parameters: null,
          },
        ],
        embedded_entities: [],
        inter_service_relations: [
          {
            name: "test",

            modifier: "rw+",
            lower_limit: 0,
            upper_limit: 5,
            entity_type: "different_entity",
          },
        ],
      },
    ],
    inter_service_relations: [
      {
        name: "test",

        modifier: "rw+",
        lower_limit: 0,
        upper_limit: 5,
        entity_type: "type1",
      },
      {
        name: "test2",

        modifier: "rw+",
        lower_limit: 1,
        upper_limit: undefined,
        entity_type: "type2",
      },
    ],
    environment: "db0dd486-c76b-4ca3-ba15-fdb67b629e4e",
    name: "entity",
  };
  const attributes = {
    candidate: {
      test: ["05715f31-8d5c-4429-aa56-e20da1da8a59"],
      test2: ["29d51b9d-0278-49be-9953-e948be3286e1"],
      id_attr: "testx",
      embedded: [
        {
          attr: null,
          test: ["05715f31-8d5c-4429-aa56-e20da1da8a59"],
          embedded: [
            { attr: null, test: ["ee6be4c1-3e38-42ad-a6c6-b37f20eedf98"] },
          ],
        },
      ],
      embedded2: [
        { test: ["8eb9a8e5-4507-49c5-95a7-481dd44e34ab"], attr_xyz: null },
      ],
    },
    active: {
      test: [
        "05715f31-8d5c-4429-aa56-e20da1da8a59",
        "05715f31-8d5c-4429-aa56-e20da1da8aff",
      ],
      test2: [],
      id_attr: "testx",
      embedded: [
        {
          attr: null,
          test: ["05715f31-8d5c-4429-aa56-e20da1da8a59"],
          embedded: [
            { attr: null, test: ["ee6be4c1-3e38-42ad-a6c6-b37f20eedf98"] },
          ],
        },
      ],
      embedded2: [
        { test: ["8eb9a8e5-4507-49c5-95a7-481dd44e34ab"], attr_xyz: null },
      ],
    },
    rollback: null,
  };
  const attributeHelper = new InventoryAttributeHelper("$", service);
  const nodes = attributeHelper.getMultiAttributeNodes(attributes);

  expect(nodes).toEqual({
    embedded: {
      kind: "Branch",
    },
    embedded$0: {
      kind: "Branch",
    },
    embedded$0$attr: {
      entity: undefined,
      hasRelation: undefined,
      kind: "Leaf",
      type: "string?",
      value: {
        candidate: null,
        active: null,
        rollback: undefined,
      },
    },
    embedded$0$embedded: {
      kind: "Branch",
    },
    embedded$0$embedded$0: {
      kind: "Branch",
    },
    embedded$0$embedded$0$attr: {
      entity: undefined,
      hasRelation: undefined,
      kind: "Leaf",
      type: "string?",
      value: {
        candidate: null,
        active: null,
        rollback: undefined,
      },
    },
    embedded$0$embedded$0$test: {
      kind: "Leaf",
      value: {
        candidate: ["ee6be4c1-3e38-42ad-a6c6-b37f20eedf98"],
        active: ["ee6be4c1-3e38-42ad-a6c6-b37f20eedf98"],
        rollback: undefined,
      },
      hasRelation: true,
      entity: "type2",
      type: undefined,
    },
    embedded$0$test: {
      kind: "Leaf",
      value: {
        candidate: ["05715f31-8d5c-4429-aa56-e20da1da8a59"],
        active: ["05715f31-8d5c-4429-aa56-e20da1da8a59"],
      },
      hasRelation: true,
      entity: "type1",
      type: undefined,
    },
    embedded2: {
      kind: "Branch",
    },
    embedded2$0: {
      kind: "Branch",
    },
    embedded2$0$attr_xyz: {
      entity: undefined,
      hasRelation: undefined,
      kind: "Leaf",
      type: "string?",
      value: {
        candidate: null,
        active: null,
        rollback: undefined,
      },
    },
    embedded2$0$test: {
      kind: "Leaf",
      type: undefined,

      value: {
        candidate: ["8eb9a8e5-4507-49c5-95a7-481dd44e34ab"],
        active: ["8eb9a8e5-4507-49c5-95a7-481dd44e34ab"],
        rollback: undefined,
      },
      hasRelation: true,
      entity: "different_entity",
    },
    id_attr: {
      entity: undefined,
      hasRelation: undefined,
      kind: "Leaf",
      type: "string",
      value: {
        active: "testx",
        candidate: "testx",
        rollback: undefined,
      },
    },
    test: {
      kind: "Leaf",
      type: undefined,

      value: {
        candidate: ["05715f31-8d5c-4429-aa56-e20da1da8a59"],
        active: [
          "05715f31-8d5c-4429-aa56-e20da1da8a59",
          "05715f31-8d5c-4429-aa56-e20da1da8aff",
        ],
        rollback: undefined,
      },
      hasRelation: true,
      entity: "type1",
    },
    test2: {
      kind: "Leaf",
      type: undefined,
      value: {
        candidate: ["29d51b9d-0278-49be-9953-e948be3286e1"],
        active: [],
        rollback: undefined,
      },
      hasRelation: true,
      entity: "type2",
    },
  });
});
