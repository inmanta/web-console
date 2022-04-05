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
      kind: "Leaf",
      value: {
        active: "d",
        candidate: undefined,
        rollback: undefined,
      },
    },
    e: {
      kind: "Leaf",
      value: {
        active: "f",
        candidate: undefined,
        rollback: undefined,
      },
    },
    g: { kind: "Branch" },
    "g.h": {
      kind: "Leaf",
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
