import { submitUpdate } from "./InstanceBackendRequestHandlers";

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
