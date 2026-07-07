import { findTopRootInstance } from "./findTopRootInstance";

interface TestShape {
  id: string;
  entityType: "core" | "embedded" | "relation";
  parentIds: Set<string>;
}

const shape = (
  id: string,
  entityType: TestShape["entityType"],
  parentIds: string[] = []
): TestShape => ({ id, entityType, parentIds: new Set(parentIds) });

const canvas = (...shapes: TestShape[]): Map<string, TestShape> =>
  new Map(shapes.map((s) => [s.id, s]));

describe("findTopRootInstance", () => {
  it("returns a non-embedded shape as-is", () => {
    const core = shape("core", "core");

    expect(findTopRootInstance(core, canvas(core))).toBe(core);
  });

  it("climbs from an embedded shape to its top root core instance", () => {
    const core = shape("core", "core");
    const embedded = shape("emb", "embedded", ["core"]);

    expect(findTopRootInstance(embedded, canvas(core, embedded))).toBe(core);
  });

  it("climbs through nested embedded shapes to the top instance", () => {
    const core = shape("core", "core");
    const outer = shape("outer", "embedded", ["core"]);
    const inner = shape("inner", "embedded", ["outer"]);

    expect(findTopRootInstance(inner, canvas(core, outer, inner))).toBe(core);
  });

  it("resolves to a relation shape when that is the top root instance", () => {
    const relation = shape("rel", "relation");
    const embedded = shape("emb", "embedded", ["rel"]);

    expect(findTopRootInstance(embedded, canvas(relation, embedded))).toBe(relation);
  });

  it("picks the first resolvable parent when several are present", () => {
    const core = shape("core", "core");
    const embedded = shape("emb", "embedded", ["missing", "core"]);

    expect(findTopRootInstance(embedded, canvas(core, embedded))).toBe(core);
  });

  it("returns undefined when no parent can be resolved", () => {
    const embedded = shape("emb", "embedded", []);

    expect(findTopRootInstance(embedded, canvas(embedded))).toBeUndefined();
  });

  it("returns undefined instead of looping on a parent cycle", () => {
    const a = shape("a", "embedded", ["b"]);
    const b = shape("b", "embedded", ["a"]);

    expect(findTopRootInstance(a, canvas(a, b))).toBeUndefined();
  });
});
