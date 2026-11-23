import { getResourceListGroups, getResourceListItems } from "./helpers";
import { Item } from "./types";

const addedB: Item = { id: "std::File[a,path=/b]", status: "added", entries: [] };
const modifiedC: Item = { id: "std::File[a,path=/c]", status: "modified", entries: [] };
const addedA: Item = { id: "std::File[a,path=/a]", status: "added", entries: [] };
const unmodifiedD: Item = { id: "std::File[a,path=/d]", status: "unmodified", entries: [] };

describe("getResourceListGroups", () => {
  it("groups the resources by status, changes first and unmodified last, each sorted by id", () => {
    expect(getResourceListGroups([unmodifiedD, addedB, modifiedC, addedA])).toEqual([
      { status: "modified", items: [modifiedC] },
      { status: "added", items: [addedA, addedB] },
      { status: "unmodified", items: [unmodifiedD] },
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
        { status: "modified", items: [modifiedC] },
        { status: "added", items: [addedA, addedB] },
      ])
    ).toEqual([modifiedC, addedA, addedB]);
  });
});
