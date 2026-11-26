import { Diff } from "@inmanta/web-console-core";
import {
  getAttributeValueOrId,
  getDiffFilterWithDefaults,
  getDiffStatusCounts,
  getHiddenByStatusCount,
  getFilteredDiffResources,
  getResourceListGroups,
  getResourceListItems,
} from "./helpers";
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

describe("getDiffFilterWithDefaults", () => {
  it("fills in the default statuses while the statuses were never changed", () => {
    expect(getDiffFilterWithDefaults({ type: ["std"] })).toEqual({
      type: ["std"],
      status: Diff.defaultStatuses,
    });
  });

  it("keeps the statuses once they were changed, also when none are ticked", () => {
    expect(getDiffFilterWithDefaults({ status: ["added"] })).toEqual({ status: ["added"] });
    expect(getDiffFilterWithDefaults({ disregardDefault: true })).toEqual({
      disregardDefault: true,
    });
  });
});

const fileOnInternal: Diff.Resource = {
  resource_id: "std::File[internal,path=/etc/hosts]",
  attributes: {},
  status: "modified",
};
const serviceOnLab: Diff.Resource = {
  resource_id: "std::Service[lab-agent,name=nginx]",
  attributes: {},
  status: "added",
};
const unparsedResource: Diff.Resource = {
  resource_id: "not-a-resource-id",
  attributes: {},
  status: "modified",
};
const diffResources = [fileOnInternal, serviceOnLab, unparsedResource];

describe("getFilteredDiffResources", () => {
  test.each`
    filter                                                                 | expected
    ${{ status: ["modified", "added"] }}                                   | ${diffResources}
    ${{ status: ["added"] }}                                               | ${[serviceOnLab]}
    ${{}}                                                                  | ${[]}
    ${{ status: ["modified", "added"], type: ["FILE"] }}                   | ${[fileOnInternal]}
    ${{ status: ["modified", "added"], agent: ["lab", "intern"] }}         | ${[fileOnInternal, serviceOnLab]}
    ${{ status: ["modified", "added"], value: ["a-resource"] }}            | ${[unparsedResource]}
    ${{ status: ["modified", "added"], type: ["file"], value: ["nginx"] }} | ${[]}
  `("returns $expected.length resources for $filter", ({ filter, expected }) => {
    expect(getFilteredDiffResources(diffResources, filter)).toEqual(expected);
  });
});

describe("getDiffStatusCounts", () => {
  it("counts the resources per status, leaving out statuses without resources", () => {
    expect(getDiffStatusCounts(diffResources)).toEqual(
      new Map([
        ["modified", 2],
        ["added", 1],
      ])
    );
  });
});

describe("getHiddenByStatusCount", () => {
  const statusCounts = new Map<Diff.Status, number>([
    ["modified", 2],
    ["added", 1],
    ["unmodified", 4],
  ]);

  test.each`
    selectedStatuses                       | expected
    ${["modified", "added", "unmodified"]} | ${0}
    ${["modified", "added"]}               | ${4}
    ${["added"]}                           | ${6}
    ${[]}                                  | ${7}
  `("returns $expected for $selectedStatuses", ({ selectedStatuses, expected }) => {
    expect(getHiddenByStatusCount(statusCounts, selectedStatuses)).toBe(expected);
  });
});
