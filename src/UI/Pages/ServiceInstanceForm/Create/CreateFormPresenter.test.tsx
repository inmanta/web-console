import { TextInputTypes } from "@patternfly/react-core";
import { CreateFormPresenter } from "./CreateFormPresenter";
import { AttributeModel } from "@/Core";
import { AttributeInputConverter } from "../AttributeConverter";

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
    new AttributeInputConverter()
  );
  const expectedFormInputAttributes = [
    {
      name: "name",
      isOptional: true,
      defaultValue: "",
      inputType: TextInputTypes.text,
      type: "string?",
      description: "name",
    },
    {
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
    const formInputAttributes =
      createFormPresenter.getFormInputsForCreateForm(attributes);
    expect(formInputAttributes).toHaveLength(2);
    expect(formInputAttributes).toEqual(expectedFormInputAttributes);
  });
  it("Presents create instance form", () => {
    const createForm = createFormPresenter.presentForm(
      attributes,
      () => {
        return;
      },
      () => {
        return;
      }
    );
    expect(createForm.props.formInputAttributes).toEqual(
      expectedFormInputAttributes
    );
  });
});
