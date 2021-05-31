import { TextInputTypes } from "@patternfly/react-core";
import { EditFormPresenter } from "./EditFormPresenter";
import { AttributeModel } from "@/Core";
import { AttributeInputConverter } from "../AttributeConverter";

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
    new AttributeInputConverter()
  );
  const instance = {
    id: "instanceId1",
    state: "creating",
    version: 4,
    service_entity: "test_service",
    environment: "env1",
    instanceSetStateTargets: [],
    candidate_attributes: {
      name: "name",
      bool_attr: "true",
      opt_string_attr: null,
      read_only: "read",
      not_editable: "shouldn't be present in edit form",
    },
    active_attributes: null,
    rollback_attributes: null,
    deleted: false,
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
      instance,
      attributes
    );
    expect(formInputAttributes).toHaveLength(3);
    expect(formInputAttributes).toEqual(expectedFormInputAttributes);
  });
  it("Presents edit instance form", () => {
    const editForm = editFormPresenter.presentForm(
      instance,
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
