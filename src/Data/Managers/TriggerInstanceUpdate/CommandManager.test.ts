import {
  BaseApiHelper,
  TriggerInstanceUpdatePatcher,
  TriggerInstanceUpdateCommandManager,
  AttributeResultConverterImpl,
} from "@/Data";

describe("TriggerInstanceUpdateCommandManager ", () => {
  const commandManager = new TriggerInstanceUpdateCommandManager(
    new TriggerInstanceUpdatePatcher(new BaseApiHelper(), "env1"),
    new AttributeResultConverterImpl()
  );
  const currentAttributes = { attr1: "some value", attr2: "", attr3: null };

  it("Calls update correctly when not setting optional attributes", () => {
    const attributes = {
      attr1: "lorem ipsum",
      attr2: "",
      attr3: null,
    };
    const submit = commandManager.getTrigger({
      kind: "TriggerInstanceUpdate",
      service_entity: "service_entity",
      id: "id1",
      version: 10,
    });
    submit([], currentAttributes, attributes);

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
    const attributes = {
      attr1: "lorem ipsum",
      attr2: null,
      attr3: true,
      attr4: "42",
    };
    const submit = commandManager.getTrigger({
      kind: "TriggerInstanceUpdate",
      service_entity: "service_entity",
      id: "id1",
      version: 10,
    });
    submit([], currentAttributes, attributes);
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
