import { BaseApiHelper } from "@/Data/API";
import { AttributeResultConverterImpl } from "@/Data/Common";
import { CreateInstancePoster } from "./Poster";
import { CreateInstanceCommandManager } from "./CommandManager";

describe("CreateInstanceManager", () => {
  const commandManager = new CreateInstanceCommandManager(
    new CreateInstancePoster(new BaseApiHelper(), "env1"),
    new AttributeResultConverterImpl()
  );
  it("Calls post on instance url when submitted", () => {
    const submit = commandManager.getTrigger({
      kind: "CreateInstance",
      service_entity: "service_entity",
    });
    submit([]);

    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][1]?.method).toEqual("POST");
  });
  it("Calls create correctly when not setting optional attributes", () => {
    const attributes = [
      { name: "string_attribute", value: "lorem ipsum", type: "string" },
      { name: "opt_string_attribute", value: "", type: "string?" },
      { name: "bool_param", value: null, type: "bool?" },
    ];
    const submit = commandManager.getTrigger({
      kind: "CreateInstance",
      service_entity: "service_entity",
    });
    submit(attributes);

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
