import { getAttributeValueOrId, getResourceListGroups, getResourceListItems } from "./helpers";
import { Item } from "./types";

const addedB: Item = { id: "std::File[a,path=/b]", status: "added", entries: [] };
const modifiedC: Item = { id: "std::File[a,path=/c]", status: "modified", entries: [] };
const addedA: Item = { id: "std::File[a,path=/a]", status: "added", entries: [] };
const unmodifiedD: Item = { id: "std::File[a,path=/d]", status: "unmodified", entries: [] };

describe("getAttributeValueOrId", () => {
  test.each`
    resourceId                                        | expected
    ${"std::File[internal,path=/tmp/dir1/file2]"}     | ${"/tmp/dir1/file2"}
    ${"std::File[internal,path=/tmp/dir1/file2],v=2"} | ${"/tmp/dir1/file2"}
    ${"std::File[internal,path]"}                     | ${"std::File[internal,path]"}
  `("returns $expected for $resourceId", ({ resourceId, expected }) => {
    expect(getAttributeValueOrId(resourceId)).toBe(expected);
  });
});

describe("getResourceListGroups", () => {
  it("groups the resources by status, changes first and unmodified last, each sorted by id", () => {
    expect(getResourceListGroups([unmodifiedD, addedB, modifiedC, addedA])).toEqual([
      { status: "modified", startIndex: 0, items: [modifiedC] },
      { status: "added", startIndex: 1, items: [addedA, addedB] },
      { status: "unmodified", startIndex: 3, items: [unmodifiedD] },
    ]);
  });

  it("returns no groups without resources", () => {
    expect(getResourceListGroups([])).toEqual([]);
  });
});

describe("getResourceListItems", () => {
  it("returns the resources group after group", () => {
    expect(
      getResourceListItems([
        { status: "modified", startIndex: 0, items: [modifiedC] },
        { status: "added", startIndex: 1, items: [addedA, addedB] },
      ])
    ).toEqual([modifiedC, addedA, addedB]);
  });
});
