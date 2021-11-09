import { BaseApiHelper } from "@/Data/API";
import { Field } from "@/Test";
import { CreateInstanceCommandManager } from "./CommandManager";

describe("CreateInstanceManager", () => {
  const commandManager = new CreateInstanceCommandManager(
    new BaseApiHelper(),
    "env1"
  );
  it("Calls post on instance url when submitted", () => {
    const submit = commandManager.getTrigger({
      kind: "CreateInstance",
      service_entity: "service_entity",
    });
    submit([], {});

    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][1]?.method).toEqual("POST");
  });
  it("Calls create correctly when not setting optional attributes", () => {
    const fields = [
      { ...Field.text, name: "string_attribute", isOptional: false },
      { ...Field.text, name: "opt_string_attribute" },
      { ...Field.bool, name: "bool_param" },
    ];
    const attributes = {
      string_attribute: "lorem ipsum",
      opt_string_attribute: "",
      bool_param: null,
    };
    const submit = commandManager.getTrigger({
      kind: "CreateInstance",
      service_entity: "service_entity",
    });
    submit(fields, attributes);

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
