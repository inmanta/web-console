import {
  getChangedParts,
  getSidesWithValues,
  getUnmarkedParts,
  isFileHash,
  isLongValue,
} from "./helpers";

describe("getChangedParts", () => {
  test("splits both values around the part between the common start and end", () => {
    expect(getChangedParts("10.0.0.1/24", "10.0.0.12/24")).toEqual({
      from: { commonStart: "10.0.0.1", changed: "", commonEnd: "/24" },
      to: { commonStart: "10.0.0.1", changed: "2", commonEnd: "/24" },
    });
  });

  test("marks the whole value when nothing is shared", () => {
    expect(getChangedParts("root", "frr")).toEqual({
      from: { commonStart: "", changed: "root", commonEnd: "" },
      to: { commonStart: "", changed: "frr", commonEnd: "" },
    });
  });

  test("doesn't count a character twice when the common start and end overlap", () => {
    expect(getChangedParts("aa", "aaa")).toEqual({
      from: { commonStart: "aa", changed: "", commonEnd: "" },
      to: { commonStart: "aa", changed: "a", commonEnd: "" },
    });
  });

  test("marks nothing when both values are equal", () => {
    expect(getChangedParts("644", "644")).toEqual({
      from: { commonStart: "644", changed: "", commonEnd: "" },
      to: { commonStart: "644", changed: "", commonEnd: "" },
    });
  });

  test("marks the whole value against an empty one", () => {
    expect(getChangedParts("", "frr")).toEqual({
      from: { commonStart: "", changed: "", commonEnd: "" },
      to: { commonStart: "", changed: "frr", commonEnd: "" },
    });
  });

  test("marks whole emoji, even when two emoji share their first UTF-16 code unit", () => {
    expect(getChangedParts("on 😀", "on 😃")).toEqual({
      from: { commonStart: "on ", changed: "😀", commonEnd: "" },
      to: { commonStart: "on ", changed: "😃", commonEnd: "" },
    });
  });
});

describe("getUnmarkedParts", () => {
  test("keeps the whole value unmarked", () => {
    expect(getUnmarkedParts("frr")).toEqual({ commonStart: "frr", changed: "", commonEnd: "" });
  });
});

describe("isLongValue", () => {
  test.each`
    fromValue | toValue        | expected
    ${"a"}    | ${"b"}         | ${false}
    ${"a\nb"} | ${"a"}         | ${true}
    ${""}     | ${"line\nend"} | ${true}
  `("$fromValue and $toValue give $expected", ({ fromValue, toValue, expected }) => {
    expect(isLongValue(fromValue, toValue)).toBe(expected);
  });
});

describe("isFileHash", () => {
  test.each`
    resourceId                        | attributeName | expected
    ${"std::File[a,path=/etc/hosts]"} | ${"hash"}     | ${true}
    ${"std::File[a,path=/etc/hosts]"} | ${"mode"}     | ${false}
    ${"fs::File[a,path=/etc/hosts]"}  | ${"hash"}     | ${true}
    ${"fs::FileSystem[a,name=root]"}  | ${"hash"}     | ${false}
    ${"std::Service[a,name=frr]"}     | ${"hash"}     | ${false}
  `("$resourceId $attributeName gives $expected", ({ resourceId, attributeName, expected }) => {
    expect(isFileHash(resourceId, attributeName)).toBe(expected);
  });
});

describe("getSidesWithValues", () => {
  test.each`
    status          | expected
    ${"added"}      | ${["to"]}
    ${"deleted"}    | ${["from"]}
    ${"modified"}   | ${["from", "to"]}
    ${"unmodified"} | ${["from", "to"]}
  `("$status gives $expected", ({ status, expected }) => {
    expect(getSidesWithValues(status)).toEqual(expected);
  });
});
