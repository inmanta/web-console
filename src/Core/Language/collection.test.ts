import {
  cloneDeep,
  groupBy,
  isEqual,
  merge,
  pickBy,
  reject,
  times,
  uniq,
  without,
} from "./collection";

describe("collection utils", () => {
  it("uniq removes duplicate values", () => {
    expect(uniq([1, 1, 2, 3, 3])).toEqual([1, 2, 3]);
    expect(uniq(["a", "a", "b"])).toEqual(["a", "b"]);
  });

  it("without removes the specified value", () => {
    expect(without([1, 2, 3, 2], 2)).toEqual([1, 3]);
  });

  it("reject removes items that match the predicate", () => {
    const items = [1, 2, 3, 4];
    const result = reject(items, (value) => value % 2 === 0);

    expect(result).toEqual([1, 3]);
  });

  it("times creates an array of mapped values", () => {
    expect(times(3, (index) => index * 2)).toEqual([0, 2, 4]);
  });

  it("cloneDeep creates a deep copy", () => {
    const original = { a: 1, nested: { b: 2 }, list: [1, 2, 3] };
    const copy = cloneDeep(original);

    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
    expect(copy.nested).not.toBe(original.nested);
    expect(copy.list).not.toBe(original.list);
  });

  it("isEqual compares primitives, arrays and objects deeply", () => {
    expect(isEqual(1, 1)).toBe(true);
    expect(isEqual(1, 2)).toBe(false);
    expect(isEqual([1, 2], [1, 2])).toBe(true);
    expect(isEqual([1, 2], [2, 1])).toBe(false);
    expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    expect(isEqual({ a: { b: 2 } }, { a: { b: 2 } })).toBe(true);
  });

  it("merge performs a deep merge of objects", () => {
    const target = { a: 1, nested: { b: 2, keep: true } };
    const source = { nested: { b: 3, c: 4 } };

    const result = merge(target, source);

    expect(result).toEqual({
      a: 1,
      nested: { b: 3, c: 4, keep: true },
    });
  });

  it("groupBy groups items by a key", () => {
    const items = [
      { name: "a", section: "x" },
      { name: "b", section: "x" },
      { name: "c", section: "y" },
    ];

    const grouped = groupBy(items, "section");

    expect(Object.keys(grouped)).toEqual(["x", "y"]);
    expect(grouped.x).toHaveLength(2);
    expect(grouped.y).toHaveLength(1);
  });

  it("pickBy keeps only entries that satisfy the predicate", () => {
    const input = { a: 1, b: undefined, c: 3 };
    const result = pickBy(input, (value) => value !== undefined);

    expect(result).toEqual({ a: 1, c: 3 });
  });
});
