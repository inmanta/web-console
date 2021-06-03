import { TextInputTypes } from "@patternfly/react-core";
import { EditFormPresenter } from "./EditFormPresenter";
import { AttributeModel } from "@/Core";
import { AttributeInputConverterImpl } from "@/Data";

describe("EditFormPresenter", () => {
  const attributes: AttributeModel[] = [
    {
      name: "name",
      type: "string",
      description: "name",
      modifier: "rw+",
      default_value_set: false,
      default_value: null,
    },
    {
      name: "bool_attr",
      type: "bool",
      description: "desc",
      modifier: "rw+",
      default_value_set: false,
      default_value: null,
    },
    {
      name: "opt_string_attr",
      type: "string?",
      description: "desc",
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
  const editFormPresenter = new EditFormPresenter(
    new AttributeInputConverterImpl()
  );
  const currentAttributes = {
    name: "name",
    bool_attr: "true",
    opt_string_attr: null,
    read_only: "read",
    not_editable: "shouldn't be present in edit form",
  };
  const expectedFormInputAttributes = [
    {
      name: "name",
      isOptional: false,
      defaultValue: "name",
      inputType: TextInputTypes.text,
      type: "string",
      description: "name",
    },
    {
      name: "bool_attr",
      isOptional: false,
      defaultValue: true,
      inputType: "bool",
      type: "bool",
      description: "desc",
    },
    {
      name: "opt_string_attr",
      isOptional: true,
      defaultValue: "",
      inputType: TextInputTypes.text,
      type: "string?",
      description: "desc",
    },
  ];
  it("Filters editable attributes", () => {
    const editable = editFormPresenter.getEditableAttributes(attributes);
    expect(editable).toHaveLength(3);
  });
  it("Creates correct form input attributes", () => {
    const formInputAttributes = editFormPresenter.getFormInputsForEditForm(
      currentAttributes,
      attributes
    );
    expect(formInputAttributes).toHaveLength(3);
    expect(formInputAttributes).toEqual(expectedFormInputAttributes);
  });
  it("Presents edit instance form", () => {
    const editForm = editFormPresenter.presentForm(
      currentAttributes,
      attributes,
      () => {
        return;
      },
      () => {
        return;
      }
    );
    expect(editForm.props.formInputAttributes).toEqual(
      expectedFormInputAttributes
    );
  });
});
