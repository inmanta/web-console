import { Reference } from "@/Core/Domain";
import { ClassifiedAttribute } from "@/Data/Common/AttributeClassifier/ClassifiedAttribute";
import { groupReplacements, partitionFramework } from "./helpers";

describe("groupReplacements", () => {
  test("groups replacements by the attribute they target", () => {
    const replacements: Reference.Replacement[] = [
      { destination: "api.'a'", attributeKey: "api", isWholeAttribute: false, referenceId: "1" },
      { destination: "api.'b'", attributeKey: "api", isWholeAttribute: false, referenceId: "2" },
      { destination: "value", attributeKey: "value", isWholeAttribute: true, referenceId: "3" },
    ];

    expect(groupReplacements(replacements)).toEqual({
      api: [replacements[0], replacements[1]],
      value: [replacements[2]],
    });
  });
});

describe("partitionFramework", () => {
  test("splits framework attributes out from the model's own, keeping order", () => {
    const attributes: ClassifiedAttribute[] = [
      { kind: "SingleLine", key: "api", value: "x" },
      { kind: "SingleLine", key: "report_only", value: "false" },
      { kind: "SingleLine", key: "url", value: "y" },
      { kind: "SingleLine", key: "send_event", value: "true" },
    ];

    const { model, framework } = partitionFramework(attributes);

    expect(model.map((attribute) => attribute.key)).toEqual(["api", "url"]);
    expect(framework.map((attribute) => attribute.key)).toEqual(["report_only", "send_event"]);
  });
});
