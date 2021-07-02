import { TextInputTypes } from "@patternfly/react-core";
import { CreateFormPresenter } from "./CreateFormPresenter";
import { AttributeModel, Field } from "@/Core";
import { AttributeInputConverterImpl } from "@/Data";

describe("CreateFormPresenter", () => {
  const attributes: AttributeModel[] = [
    {
      name: "name",
      type: "string?",
      description: "name",
      modifier: "rw+",
      default_value_set: false,
      default_value: null,
    },
    {
      name: "not_editable",
      type: "string",
      description: "a non updateable attribute",
      modifier: "rw",
      default_value_set: false,
      default_value: null,
    },
    {
      name: "read_only",
      type: "string",
      description: "a read-only",
      modifier: "r",
      default_value_set: false,
      default_value: null,
    },
  ];
  const createFormPresenter = new CreateFormPresenter(
    new AttributeInputConverterImpl()
  );
  const expectedFields: Field[] = [
    {
      kind: "Flat",
      name: "name",
      isOptional: true,
      defaultValue: "",
      inputType: TextInputTypes.text,
      type: "string?",
      description: "name",
    },
    {
      kind: "Flat",
      name: "not_editable",
      isOptional: false,
      defaultValue: "",
      inputType: TextInputTypes.text,
      type: "string",
      description: "a non updateable attribute",
    },
  ];
  it("Filters not-readonly attributes", () => {
    const notReadOnly =
      createFormPresenter.getNotReadonlyAttributes(attributes);
    expect(notReadOnly).toHaveLength(2);
  });
  it("Creates correct form input attributes", () => {
    const fields = createFormPresenter.getFieldsForCreateForm(attributes);
    expect(fields).toHaveLength(2);
    expect(fields).toEqual(expectedFields);
  });
  it("Presents create instance form", () => {
    const createForm = createFormPresenter.presentForm(
      createFormPresenter.getFieldsForCreateForm(attributes),
      () => {
        return;
      },
      () => {
        return;
      }
    );
    expect(createForm.props.fields).toEqual(expectedFields);
  });
});
