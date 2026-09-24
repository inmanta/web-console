import { Reference } from "@/Core/Domain";
import { summarize } from "./summarize";

const reference = (args: Reference.Argument[]): Reference.Reference => ({
  id: "ref-1",
  type: "std::Environment",
  args,
});

describe("summarize", () => {
  test("falls back to the type name when there are no literal arguments", () => {
    expect(summarize(reference([{ kind: "reference", name: "child", referenceId: "ref-2" }]))).toBe(
      "std::Environment"
    );
  });

  test("labels a single literal as name=value", () => {
    expect(
      summarize(reference([{ kind: "literal", name: "name", value: "CLOUDSMITH_API_KEY" }]))
    ).toBe("std::Environment(name=CLOUDSMITH_API_KEY)");
  });

  test("uses at most the first two literal arguments", () => {
    expect(
      summarize(
        reference([
          { kind: "literal", name: "a", value: "1" },
          { kind: "literal", name: "b", value: "2" },
          { kind: "literal", name: "c", value: "3" },
        ])
      )
    ).toBe("std::Environment(a=1, b=2)");
  });

  test("truncates a long literal value", () => {
    const value = "a".repeat(50);

    expect(summarize(reference([{ kind: "literal", name: "k", value }]))).toBe(
      `std::Environment(k=${"a".repeat(40)}...)`
    );
  });

  test("masks a literal whose name marks it as a password", () => {
    expect(summarize(reference([{ kind: "literal", name: "password", value: "hunter2" }]))).toBe(
      "std::Environment(password=****)"
    );
  });

  test('renders the "<<undefined>>" sentinel as "undefined"', () => {
    expect(summarize(reference([{ kind: "literal", name: "n", value: "<<undefined>>" }]))).toBe(
      "std::Environment(n=undefined)"
    );
  });
});
