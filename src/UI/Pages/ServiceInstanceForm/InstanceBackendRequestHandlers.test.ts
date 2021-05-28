import { ServiceModel } from "@/Core";
import { submitCreate, submitUpdate } from "./InstanceBackendRequestHandlers";

describe("Instance Create handler", () => {
  const serviceEntity: ServiceModel = {
    name: "test-service",
    attributes: [
      {
        name: "string_attribute",
        type: "string",
        description: "an attribute",
        modifier: "rw",
        default_value_set: false,
        default_value: null,
      },
      {
        name: "opt_string_attribute",
        type: "string?",
        description: "an attribute",
        modifier: "rw+",
        default_value_set: false,
        default_value: null,
      },
      {
        name: "bool_param",
        type: "bool?",
        description: "a boolean attribute",
        modifier: "rw+",
        default_value_set: false,
        default_value: null,
      },
    ],
    environment: "env",
    lifecycle: { initial_state: "start", states: [], transfers: [] },
    config: {},
  };
  it("Calls post on instance url when submitted", () => {
    const attributes = [
      { name: "string_attribute", value: "lorem ipsum", type: "string" },
    ];
    submitCreate(
      serviceEntity,
      attributes,
      () => {
        return;
      },
      () => {
        return;
      }
    );
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][1]?.method).toEqual("POST");
  });
  it("Calls create correctly when not setting optional attributes", () => {
    const attributes = [
      { name: "string_attribute", value: "lorem ipsum", type: "string" },
      { name: "opt_string_attribute", value: "", type: "string?" },
      { name: "bool_param", value: null, type: "bool?" },
    ];
    submitCreate(
      serviceEntity,
      attributes,
      () => {
        return;
      },
      () => {
        return;
      }
    );
    expect(fetchMock.mock.calls).toHaveLength(1);
    const attributesFromBody = JSON.parse(
      fetchMock.mock.calls[0][1]?.body as string
    ).attributes;
    expect(attributesFromBody.string_attribute).toEqual("lorem ipsum");
    expect(attributesFromBody.opt_string_attribute).toBeUndefined();
    expect(attributesFromBody.bool_param).toBeUndefined();
    expect(fetchMock.mock.calls[0][1]?.method).toEqual("POST");
  });
});

describe("Instance Update handler", () => {
  const instance = {
    id: "id1",
    state: "up",
    version: 10,
    service_entity: "test-service",
    environment: "env",
    candidate_attributes: null,
    active_attributes: { attr1: "some value", attr2: "", attr3: null },
    rollback_attributes: null,
    instanceSetStateTargets: [],
    deleted: false,
  };
  it("Calls update correctly when not setting optional attributes", () => {
    const attributes = [
      { name: "attr1", value: "lorem ipsum", type: "string" },
      { name: "attr2", value: "", type: "string" },
      { name: "attr3", value: null, type: "bool?" },
    ];
    submitUpdate(
      instance,
      attributes,
      () => {
        return;
      },
      () => {
        return;
      }
    );
    expect(fetchMock.mock.calls).toHaveLength(1);
    const attributesFromBody = JSON.parse(
      fetchMock.mock.calls[0][1]?.body as string
    ).attributes;
    expect(attributesFromBody.attr1).toEqual("lorem ipsum");
    expect(attributesFromBody.attr2).toBeUndefined();
    expect(attributesFromBody.attr3).toBeUndefined();
    expect(fetchMock.mock.calls[0][1]?.method).toEqual("PATCH");
  });
  it("Calls update correctly when changing optional attributes", () => {
    const attributes = [
      { name: "attr1", value: "lorem ipsum", type: "string" },
      { name: "attr2", value: null, type: "string?" },
      { name: "attr3", value: true, type: "bool?" },
      { name: "attr4", value: "42", type: "int?" },
    ];
    submitUpdate(
      instance,
      attributes,
      () => {
        return;
      },
      () => {
        return;
      }
    );
    expect(fetchMock.mock.calls).toHaveLength(1);
    const attributesFromBody = JSON.parse(
      fetchMock.mock.calls[0][1]?.body as string
    ).attributes;
    expect(attributesFromBody.attr1).toEqual("lorem ipsum");
    expect(attributesFromBody.attr2).toBeNull();
    expect(attributesFromBody.attr3).toBeTruthy();
    expect(attributesFromBody.attr4).toEqual(42);
    expect(fetchMock.mock.calls[0][1]?.method).toEqual("PATCH");
  });
});
