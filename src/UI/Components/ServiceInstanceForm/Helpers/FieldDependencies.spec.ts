import { DictListField, Field, FormSuggestion, TextField } from "@/Core";
import * as Test from "@/Test";
import { words } from "@/UI/words";
import { resolveFieldDependencies } from "./FieldDependencies";

const textField = (name: string, suggestion: FormSuggestion | null = null): TextField => ({
  ...Test.Field.text,
  name,
  suggestion,
});

const dictList = (name: string, fields: Field[]): DictListField => ({
  kind: "DictList",
  name,
  description: null,
  isOptional: false,
  isDisabled: false,
  fields,
  min: 0,
  max: null,
});

const dependsOn = (reference: string): FormSuggestion => ({
  type: "parameters",
  parameter_name: `files_\${${reference}}`,
});

describe("resolveFieldDependencies", () => {
  it("reports no errors for a form without field references", () => {
    expect(resolveFieldDependencies([textField("site"), textField("uplink")]).errors).toEqual([]);
  });

  it("reports no errors when a ${form.*} reference names an existing root field", () => {
    expect(
      resolveFieldDependencies([textField("site"), textField("uplink", dependsOn("form.site"))])
        .errors
    ).toEqual([]);
  });

  it("reports a missing dependency when the referenced field does not exist", () => {
    expect(resolveFieldDependencies([textField("uplink", dependsOn("form.nope"))]).errors).toEqual([
      words("inventory.form.suggestions.missingDependency")("uplink", "form.nope"),
    ]);
  });

  it("resolves a ${self.*} reference among the field's own siblings", () => {
    const embedded = dictList("endpoints", [
      textField("region", dependsOn("self.zone")),
      textField("zone"),
    ]);

    expect(resolveFieldDependencies([embedded]).errors).toEqual([]);
  });

  it("does not let ${self.*} search outward to a same-named field in another scope", () => {
    // `site` exists at the root, but not among the embedded field's siblings, so a
    // `self` reference to it is a model error (no outward search).
    const embedded = dictList("endpoints", [textField("region", dependsOn("self.site"))]);

    expect(resolveFieldDependencies([textField("site"), embedded]).errors).toEqual([
      words("inventory.form.suggestions.missingDependency")("region", "self.site"),
    ]);
  });

  it("lets ${form.*} from an embedded field resolve against the root scope", () => {
    const embedded = dictList("endpoints", [textField("region", dependsOn("form.site"))]);

    expect(resolveFieldDependencies([textField("site"), embedded]).errors).toEqual([]);
  });

  it("surfaces a dependency cycle instead of looping", () => {
    const a = textField("a", dependsOn("form.b"));
    const b = textField("b", dependsOn("form.a"));

    expect(resolveFieldDependencies([a, b]).errors).toEqual([
      words("inventory.form.suggestions.dependencyCycle")("a -> b -> a"),
    ]);
  });
});
