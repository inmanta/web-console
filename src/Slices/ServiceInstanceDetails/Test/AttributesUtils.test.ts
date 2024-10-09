import { InstanceLog } from "@/Slices/ServiceInstanceHistory/Core/Domain";
import {
  formatTreeRowData,
  getAvailableAttributesSets,
  sortTreeRows,
  TreeRowData,
} from "../Utils";
import { historyData } from "./mockData";

describe("getAvailableAttributesSets", () => {
  it("should return an empty object if no log matches the version", () => {
    const logs: InstanceLog[] = historyData;

    const result = getAvailableAttributesSets(logs, "2.0");

    expect(result).toEqual({});
  });

  it("should return an empty object if logs array is empty", () => {
    const result = getAvailableAttributesSets([], "1.0");

    expect(result).toEqual({});
  });

  it("should return active_attributes if they exist in the selected log", () => {
    const logs: InstanceLog[] = historyData;

    const result = getAvailableAttributesSets(logs, "3");

    expect(result).toEqual({
      active_attributes: {
        name: "core1",
        site: {
          name: "inmanta-lab",
          infra_vendor: "vcenter",
        },
        system_id: 1,
        epc_version: "11.3.2-1",
        telco_ip_range: "192.168.126.0/24",
      },
    });
  });

  it("should return candidate_attributes if they exist in the selected log", () => {
    const logs: InstanceLog[] = historyData;

    const result = getAvailableAttributesSets(logs, "2");

    expect(result).toEqual({
      candidate_attributes: {
        name: "core1",
        site: {
          name: "inmanta-lab-0",
          infra_vendor: "vcenter",
        },
        system_id: 1,
        epc_version: "11.3.2-1",
        telco_ip_range: "192.168.126.0/24",
      },
    });
  });

  it("should return rollback_attributes if they exist in the selected log", () => {
    const logs: InstanceLog[] = historyData;

    const result = getAvailableAttributesSets(logs, "1");

    expect(result).toEqual({
      rollback_attributes: {
        name: "core1",
        site: {
          name: "inmanta-lab",
          infra_vendor: "vcenter",
        },
        system_id: 1,
        epc_version: "11.3.2-1",
        telco_ip_range: "192.168.126.0/24",
      },
    });
  });

  it("should return all attribute sets if they all exist in the selected log", () => {
    const logs: InstanceLog[] = historyData;

    const result = getAvailableAttributesSets(logs, "5");

    expect(result).toEqual({
      active_attributes: {
        name: "core1",
        site: {
          name: "inmanta-lab",
          infra_vendor: "vcenter",
        },
        system_id: 1,
        epc_version: "11.3.2-1",
        telco_ip_range: "192.168.126.0/24",
      },
      candidate_attributes: {
        name: "core1",
        site: {
          name: "inmanta-lab",
          infra_vendor: "vcenter",
        },
        system_id: 1,
        epc_version: "11.3.2-1",
        telco_ip_range: "192.168.126.0/24",
      },
      rollback_attributes: {
        name: "core1",
        site: {
          name: "inmanta-lab",
          infra_vendor: "vcenter",
        },
        system_id: 1,
        epc_version: "11.3.2-1",
        telco_ip_range: "192.168.126.0/24",
      },
    });
  });
});

describe("formatTreeRowData", () => {
  it("should return an empty array when the attributes object is empty", () => {
    const result = formatTreeRowData({});

    expect(result).toEqual([]);
  });

  it("should format a flat object with primitive values correctly", () => {
    const attributes = {
      key1: "value1",
      key2: 123,
      key3: true,
    };

    const result = formatTreeRowData(attributes);

    expect(result).toMatchObject([
      {
        id: expect.stringMatching(/^key1/),
        name: "key1",
        value: "value1",
        children: [],
      },
      {
        id: expect.stringMatching(/^key2/),
        name: "key2",
        value: 123,
        children: [],
      },
      {
        id: expect.stringMatching(/^key3/),
        name: "key3",
        value: true,
        children: [],
      },
    ]);
  });

  it("should format an object with nested objects correctly", () => {
    const attributes = {
      parent: {
        child1: "value1",
        child2: 456,
      },
    };

    const result = formatTreeRowData(attributes);

    expect(result).toMatchObject([
      {
        id: expect.stringMatching(/^parent/),
        name: "parent",
        value: { child1: "value1", child2: 456 },
        children: [
          {
            id: expect.stringMatching(/^child1/),
            name: "child1",
            value: "value1",
            children: [],
          },
          {
            id: expect.stringMatching(/^child2/),
            name: "child2",
            value: 456,
            children: [],
          },
        ],
      },
    ]);
  });

  it("should format an array of objects correctly", () => {
    const attributes = {
      arrayKey: [{ subKey1: "subValue1" }, { subKey2: "subValue2" }],
    };

    const result = formatTreeRowData(attributes);

    expect(result).toMatchObject([
      {
        id: expect.stringMatching(/^arrayKey/),
        name: "arrayKey",
        value: [{ subKey1: "subValue1" }, { subKey2: "subValue2" }],
        children: [
          {
            id: expect.stringMatching(/^arrayKey/),
            name: "0",
            value: { subKey1: "subValue1" },
            children: [
              {
                id: expect.stringMatching(/^subKey1/),
                name: "subKey1",
                value: "subValue1",
                children: [],
              },
            ],
          },
          {
            id: expect.stringMatching(/^arrayKey/),
            name: "1",
            value: { subKey2: "subValue2" },
            children: [
              {
                id: expect.stringMatching(/^subKey2/),
                name: "subKey2",
                value: "subValue2",
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("should format deeply nested objects correctly", () => {
    const attributes = {
      level1: {
        level2: {
          level3: "deepValue",
        },
      },
    };

    const result = formatTreeRowData(attributes);

    expect(result).toMatchObject([
      {
        id: expect.stringMatching(/^level1/),
        name: "level1",
        value: { level2: { level3: "deepValue" } },
        children: [
          {
            id: expect.stringMatching(/^level2/),
            name: "level2",
            value: { level3: "deepValue" },
            children: [
              {
                id: expect.stringMatching(/^level3/),
                name: "level3",
                value: "deepValue",
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });
});

describe("sortTreeRows", () => {
  it("should return an empty array when input is empty", () => {
    const result = sortTreeRows([], "asc");

    expect(result).toEqual([]);
  });

  it("should sort a flat array of TreeRowData in ascending order", () => {
    const tableData: TreeRowData[] = [
      { id: "2", name: "Banana", value: "fruit", children: [] },
      { id: "1", name: "Apple", value: "fruit", children: [] },
      { id: "3", name: "Cherry", value: "fruit", children: [] },
    ];

    const result = sortTreeRows(tableData, "asc");

    expect(result).toEqual([
      { id: "1", name: "Apple", value: "fruit", children: [] },
      { id: "2", name: "Banana", value: "fruit", children: [] },
      { id: "3", name: "Cherry", value: "fruit", children: [] },
    ]);
  });

  it("should sort a flat array of TreeRowData in descending order", () => {
    const tableData: TreeRowData[] = [
      { id: "2", name: "Banana", value: "fruit", children: [] },
      { id: "1", name: "Apple", value: "fruit", children: [] },
      { id: "3", name: "Cherry", value: "fruit", children: [] },
    ];

    const result = sortTreeRows(tableData, "desc");

    expect(result).toEqual([
      { id: "3", name: "Cherry", value: "fruit", children: [] },
      { id: "2", name: "Banana", value: "fruit", children: [] },
      { id: "1", name: "Apple", value: "fruit", children: [] },
    ]);
  });

  it("should sort a nested array of TreeRowData in ascending order", () => {
    const tableData: TreeRowData[] = [
      {
        id: "2",
        name: "Banana",
        value: "fruit",
        children: [
          { id: "4", name: "C", value: "subfruit", children: [] },
          { id: "5", name: "A", value: "subfruit", children: [] },
        ],
      },
      {
        id: "1",
        name: "Apple",
        value: "fruit",
        children: [],
      },
    ];

    const result = sortTreeRows(tableData, "asc");

    expect(result).toEqual([
      {
        id: "1",
        name: "Apple",
        value: "fruit",
        children: [],
      },
      {
        id: "2",
        name: "Banana",
        value: "fruit",
        children: [
          { id: "5", name: "A", value: "subfruit", children: [] },
          { id: "4", name: "C", value: "subfruit", children: [] },
        ],
      },
    ]);
  });

  it("should sort a nested array of TreeRowData in descending order", () => {
    const tableData: TreeRowData[] = [
      {
        id: "2",
        name: "Banana",
        value: "fruit",
        children: [
          { id: "4", name: "C", value: "subfruit", children: [] },
          { id: "5", name: "A", value: "subfruit", children: [] },
        ],
      },
      {
        id: "1",
        name: "Apple",
        value: "fruit",
        children: [],
      },
    ];

    const result = sortTreeRows(tableData, "desc");

    expect(result).toEqual([
      {
        id: "2",
        name: "Banana",
        value: "fruit",
        children: [
          { id: "4", name: "C", value: "subfruit", children: [] },
          { id: "5", name: "A", value: "subfruit", children: [] },
        ],
      },
      {
        id: "1",
        name: "Apple",
        value: "fruit",
        children: [],
      },
    ]);
  });

  it("should handle ties in sorting correctly", () => {
    const tableData: TreeRowData[] = [
      { id: "2", name: "Banana", value: "fruit", children: [] },
      { id: "1", name: "Apple", value: "fruit", children: [] },
      { id: "3", name: "Banana", value: "fruit", children: [] },
    ];

    const result = sortTreeRows(tableData, "asc");

    expect(result).toEqual([
      { id: "1", name: "Apple", value: "fruit", children: [] },
      { id: "2", name: "Banana", value: "fruit", children: [] },
      { id: "3", name: "Banana", value: "fruit", children: [] },
    ]);
  });
});
