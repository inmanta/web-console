import { InstanceLog } from "@/Core/Domain/HistoryLog";
import {
  formatTreeRowData,
  getAttributeSetsFromInstance,
  getAvailableAttributesSets,
  sortTreeRows,
  TreeRowData,
} from "../Utils";
import { historyData, instanceData } from "./mockData";

const mockServiceModel = {
  name: "TestService",
  environment: "test-env",
  description: "A mock service model for arrayKey test",
  lifecycle: {
    initial_state: "init",
    states: [
      { name: "init", deleted: false, export_resources: false, purge_resources: false },
      { name: "active", deleted: false, export_resources: true, purge_resources: false },
    ],
    transfers: [],
  },
  attributes: [
    {
      name: "arrayKey",
      type: "array",
      description: "An array of objects with subKeys",
      modifier: "rw",
      default_value: [],
      default_value_set: false,
      validation_type: null,
      validation_parameters: null,
    },
  ],
  service_identity: undefined,
  service_identity_display_name: undefined,
  entity_annotations: {},
  config: {},
  instance_summary: undefined,
  embedded_entities: [],
  inter_service_relations: [],
  strict_modifier_enforcement: false,
  key_attributes: ["arrayKey"],
  owner: null,
  owned_entities: [],
  version: undefined,
  relation_to_owner: undefined,
};

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

describe("getAttributeSetsFromInstance", () => {
  it("should return an empty object if no attribute sets exist in the instance", () => {
    const result = getAttributeSetsFromInstance({
      ...instanceData,
      active_attributes: null,
      candidate_attributes: null,
      rollback_attributes: null,
    });

    expect(result).toStrictEqual({});
  });

  it("should return only the existing attribute sets if some are missing", () => {
    const result = getAttributeSetsFromInstance(instanceData);

    expect(result).toStrictEqual({
      active_attributes: instanceData.active_attributes,
      candidate_attributes: instanceData.candidate_attributes,
    });

    const result2 = getAttributeSetsFromInstance({
      ...instanceData,
      candidate_attributes: null,
    });

    expect(result2).toStrictEqual({
      active_attributes: instanceData.active_attributes,
    });

    const result3 = getAttributeSetsFromInstance({
      ...instanceData,
      active_attributes: null,
    });

    expect(result3).toStrictEqual({
      candidate_attributes: instanceData.candidate_attributes,
    });
  });

  it("should return all attributes if they exist in the instance", () => {
    const result = getAttributeSetsFromInstance({
      ...instanceData,
      rollback_attributes: instanceData.active_attributes,
    });

    expect(result).toStrictEqual({
      active_attributes: instanceData.active_attributes,
      candidate_attributes: instanceData.candidate_attributes,
      rollback_attributes: instanceData.active_attributes,
    });
  });
});

describe("formatTreeRowData", () => {
  it("should return an empty array when the attributes object is empty", () => {
    const result = formatTreeRowData({}, mockServiceModel);

    expect(result).toEqual([]);
  });

  it("should format a flat object with primitive values correctly", () => {
    const attributes = {
      key1: "value1",
      key2: 123,
      key3: true,
    };
    const result = formatTreeRowData(attributes, mockServiceModel);
    expect(result).toMatchObject([
      {
        id: expect.stringMatching(/^key1/),
        name: "key1",
        value: "value1",
        children: [],
        type: "Value",
      },
      {
        id: expect.stringMatching(/^key2/),
        name: "key2",
        value: 123,
        children: [],
        type: "Value",
      },
      {
        id: expect.stringMatching(/^key3/),
        name: "key3",
        value: true,
        children: [],
        type: "Value",
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
    const result = formatTreeRowData(attributes, mockServiceModel);
    expect(result).toMatchObject([
      {
        id: expect.stringMatching(/^parent/),
        name: "parent",
        value: { child1: "value1", child2: 456 },
        type: "Embedded",
        children: [
          {
            id: expect.stringMatching(/^parent.child1/),
            name: "child1",
            value: "value1",
            type: "Value",
            children: [],
          },
          {
            id: expect.stringMatching(/^parent.child2/),
            name: "child2",
            value: 456,
            type: "Value",
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
    const model = {
      ...mockServiceModel,
      attributes: [
        ...mockServiceModel.attributes,
        {
          name: "arrayKey",
          type: "array",
          modifier: "rw",
          default_value: [],
          default_value_set: false,
          validation_type: null,
          validation_parameters: null,
        },
      ],
    };
    const result = formatTreeRowData(attributes, model);
    expect(result).toMatchObject([
      {
        id: expect.stringMatching(/^arrayKey/),
        name: "arrayKey",
        value: [{ subKey1: "subValue1" }, { subKey2: "subValue2" }],
        type: "Embedded",
        children: [
          {
            id: expect.stringMatching(/^arrayKey.0/),
            name: "0",
            value: { subKey1: "subValue1" },
            type: "Embedded",
            children: [
              {
                id: expect.stringMatching(/^arrayKey.0.subKey1/),
                name: "subKey1",
                value: "subValue1",
                type: "Value",
                children: [],
              },
            ],
          },
          {
            id: expect.stringMatching(/^arrayKey.1/),
            name: "1",
            value: { subKey2: "subValue2" },
            type: "Embedded",
            children: [
              {
                id: expect.stringMatching(/^arrayKey.1.subKey2/),
                name: "subKey2",
                value: "subValue2",
                type: "Value",
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
    const result = formatTreeRowData(attributes, mockServiceModel);
    expect(result).toMatchObject([
      {
        id: expect.stringMatching(/^level1/),
        name: "level1",
        value: { level2: { level3: "deepValue" } },
        type: "Embedded",
        children: [
          {
            id: expect.stringMatching(/^level1.level2/),
            name: "level2",
            value: { level3: "deepValue" },
            type: "Embedded",
            children: [
              {
                id: expect.stringMatching(/^level1.level2.level3/),
                name: "level3",
                value: "deepValue",
                type: "Value",
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("should format an array of primitives correctly", () => {
    const attributes = {
      numbers: [1, 2, 3],
    };
    const model = {
      ...mockServiceModel,
      attributes: [
        ...mockServiceModel.attributes,
        {
          name: "numbers",
          type: "array",
          modifier: "rw",
          default_value: [],
          default_value_set: false,
          validation_type: null,
          validation_parameters: null,
        },
      ],
    };
    const result = formatTreeRowData(attributes, model);
    expect(result).toMatchObject([
      {
        id: expect.stringMatching(/^numbers/),
        name: "numbers",
        value: [1, 2, 3],
        type: "Embedded",
        children: [
          { id: expect.stringMatching(/^numbers.0/), name: "0", value: 1, type: "Value" },
          { id: expect.stringMatching(/^numbers.1/), name: "1", value: 2, type: "Value" },
          { id: expect.stringMatching(/^numbers.2/), name: "2", value: 3, type: "Value" },
        ],
      },
    ]);
  });

  it("should format an array of arrays correctly", () => {
    const attributes = {
      matrix: [
        [1, 2],
        [3, 4],
      ],
    };
    const model = {
      ...mockServiceModel,
      attributes: [
        ...mockServiceModel.attributes,
        {
          name: "matrix",
          type: "array",
          modifier: "rw",
          default_value: [],
          default_value_set: false,
          validation_type: null,
          validation_parameters: null,
        },
      ],
    };
    const result = formatTreeRowData(attributes, model);
    expect(result).toMatchObject([
      {
        id: expect.stringMatching(/^matrix/),
        name: "matrix",
        value: [
          [1, 2],
          [3, 4],
        ],
        type: "Embedded",
        children: [
          {
            id: expect.stringMatching(/^matrix.0/),
            name: "0",
            value: [1, 2],
            type: "Embedded",
            children: [
              { id: expect.stringMatching(/^matrix.0.0/), name: "0", value: 1, type: "Value" },
              { id: expect.stringMatching(/^matrix.0.1/), name: "1", value: 2, type: "Value" },
            ],
          },
          {
            id: expect.stringMatching(/^matrix.1/),
            name: "1",
            value: [3, 4],
            type: "Embedded",
            children: [
              { id: expect.stringMatching(/^matrix.1.0/), name: "0", value: 3, type: "Value" },
              { id: expect.stringMatching(/^matrix.1.1/), name: "1", value: 4, type: "Value" },
            ],
          },
        ],
      },
    ]);
  });

  it("should format an attribute that matches an embedded entity name", () => {
    const attributes = {
      site: { name: "siteA", infra_vendor: "aws" },
    };
    const model = {
      ...mockServiceModel,
      embedded_entities: [
        {
          name: "site",
          type: "siteType",
          description: "A site entity",
          modifier: "rw",
          lower_limit: 1,
          upper_limit: 1,
          attributes: [
            {
              name: "name",
              type: "string",
              modifier: "rw",
              default_value: null,
              default_value_set: false,
              validation_type: null,
              validation_parameters: null,
            },
            {
              name: "infra_vendor",
              type: "string",
              modifier: "rw",
              default_value: null,
              default_value_set: false,
              validation_type: null,
              validation_parameters: null,
            },
          ],
          embedded_entities: [],
          inter_service_relations: [],
          key_attributes: [],
        },
      ],
    };
    const result = formatTreeRowData(attributes, model);
    expect(result).toMatchObject([
      {
        id: expect.stringMatching(/^site/),
        name: "site",
        value: { name: "siteA", infra_vendor: "aws" },
        type: "Embedded",
        children: [
          { id: expect.stringMatching(/^site.name/), name: "name", value: "siteA", type: "Value" },
          {
            id: expect.stringMatching(/^site.infra_vendor/),
            name: "infra_vendor",
            value: "aws",
            type: "Value",
          },
        ],
      },
    ]);
  });

  it("should format an attribute that matches an inter_service_relation name as Relation", () => {
    const attributes = {
      relatedService: "service-123",
    };
    const model = {
      ...mockServiceModel,
      inter_service_relations: [
        {
          name: "relatedService",
          entity_type: "OtherService",
          lower_limit: 0,
          upper_limit: 1,
          modifier: "rw",
        },
      ],
    };
    const result = formatTreeRowData(attributes, model);
    expect(result).toMatchObject([
      {
        id: expect.stringMatching(/^relatedService/),
        name: "relatedService",
        value: "service-123",
        type: "Relation",
        serviceName: "OtherService",
        children: [],
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
      { id: "2", name: "Banana", value: "fruit", type: "Value", children: [] },
      { id: "1", name: "Apple", value: "fruit", type: "Value", children: [] },
      { id: "3", name: "Cherry", value: "fruit", type: "Value", children: [] },
    ];

    const result = sortTreeRows(tableData, "asc");

    expect(result).toEqual([
      { id: "1", name: "Apple", value: "fruit", type: "Value", children: [] },
      { id: "2", name: "Banana", value: "fruit", type: "Value", children: [] },
      { id: "3", name: "Cherry", value: "fruit", type: "Value", children: [] },
    ]);
  });

  it("should sort a flat array of TreeRowData in descending order", () => {
    const tableData: TreeRowData[] = [
      { id: "2", name: "Banana", value: "fruit", type: "Value", children: [] },
      { id: "1", name: "Apple", value: "fruit", type: "Value", children: [] },
      { id: "3", name: "Cherry", value: "fruit", type: "Value", children: [] },
    ];

    const result = sortTreeRows(tableData, "desc");

    expect(result).toEqual([
      { id: "3", name: "Cherry", value: "fruit", type: "Value", children: [] },
      { id: "2", name: "Banana", value: "fruit", type: "Value", children: [] },
      { id: "1", name: "Apple", value: "fruit", type: "Value", children: [] },
    ]);
  });

  it("should sort a nested array of TreeRowData in ascending order", () => {
    const tableData: TreeRowData[] = [
      {
        id: "2",
        name: "Banana",
        value: "fruit",
        type: "Value",
        children: [
          { id: "4", name: "C", value: "subfruit", type: "Value", children: [] },
          { id: "5", name: "A", value: "subfruit", type: "Value", children: [] },
        ],
      },
      {
        id: "1",
        name: "Apple",
        value: "fruit",
        type: "Value",
        children: [],
      },
    ];

    const result = sortTreeRows(tableData, "asc");

    expect(result).toEqual([
      {
        id: "1",
        name: "Apple",
        value: "fruit",
        type: "Value",
        children: [],
      },
      {
        id: "2",
        name: "Banana",
        value: "fruit",
        type: "Value",
        children: [
          { id: "5", name: "A", value: "subfruit", type: "Value", children: [] },
          { id: "4", name: "C", value: "subfruit", type: "Value", children: [] },
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
        type: "Value",
        children: [
          { id: "4", name: "C", value: "subfruit", type: "Value", children: [] },
          { id: "5", name: "A", value: "subfruit", type: "Value", children: [] },
        ],
      },
      {
        id: "1",
        name: "Apple",
        value: "fruit",
        type: "Value",
        children: [],
      },
    ];

    const result = sortTreeRows(tableData, "desc");

    expect(result).toEqual([
      {
        id: "2",
        name: "Banana",
        value: "fruit",
        type: "Value",
        children: [
          { id: "4", name: "C", value: "subfruit", type: "Value", children: [] },
          { id: "5", name: "A", value: "subfruit", type: "Value", children: [] },
        ],
      },
      {
        id: "1",
        name: "Apple",
        value: "fruit",
        type: "Value",
        children: [],
      },
    ]);
  });

  it("should handle ties in sorting correctly", () => {
    const tableData: TreeRowData[] = [
      { id: "2", name: "Banana", value: "fruit", type: "Value", children: [] },
      { id: "1", name: "Apple", value: "fruit", type: "Value", children: [] },
      { id: "3", name: "Banana", value: "fruit", type: "Value", children: [] },
    ];

    const result = sortTreeRows(tableData, "asc");

    expect(result).toEqual([
      { id: "1", name: "Apple", value: "fruit", type: "Value", children: [] },
      { id: "2", name: "Banana", value: "fruit", type: "Value", children: [] },
      { id: "3", name: "Banana", value: "fruit", type: "Value", children: [] },
    ]);
  });
});
