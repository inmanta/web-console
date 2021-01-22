import { RowHelper } from "./RowHelper";

test("RowHelper getPaths", () => {
  const rowHelper = new RowHelper(".");
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
  const paths = rowHelper.getPaths(attributes);

  expect(paths).toEqual(["a", "a.b", "a.b.c", "e", "g", "g.h"]);
});

test("RowHelper getMultiAttributeDict", () => {
  const rowHelper = new RowHelper(".");
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
  const multiAttributeDict = rowHelper.getMultiAttributeDict(attributes);

  expect(multiAttributeDict).toEqual({
    a: { done: false },
    "a.b": { done: false },
    "a.b.c": {
      done: true,
      value: {
        active: "d",
        candidate: undefined,
        rollback: undefined,
      },
    },
    e: {
      done: true,
      value: {
        active: "f",
        candidate: undefined,
        rollback: undefined,
      },
    },
    g: { done: false },
    "g.h": {
      done: true,
      value: {
        active: "i",
        candidate: undefined,
        rollback: undefined,
      },
    },
  });
});
