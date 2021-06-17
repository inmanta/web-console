import { AttributeModel, FormAttributeResult } from "@/Core";
import React from "react";
import { FormInputAttribute, ServiceInstanceForm } from "@/UI/Components";
import { AttributeInputConverter } from "@/Data";

export class CreateFormPresenter {
  constructor(
    private readonly attributeInputConverter: AttributeInputConverter
  ) {}
  presentForm(
    attributes: AttributeModel[],
    onSubmit: (attributes: FormAttributeResult[]) => void,
    onRedirect: () => void
  ): React.ReactElement {
    const formInputAttributes = this.getFormInputsForCreateForm(attributes);

    return (
      <ServiceInstanceForm
        formInputAttributes={formInputAttributes}
        onSubmit={onSubmit}
        onCancel={onRedirect}
      />
    );
  }

  getFormInputsForCreateForm(
    attributeModels: AttributeModel[]
  ): FormInputAttribute[] {
    return this.convertToFormInputs(
      this.getNotReadonlyAttributes(attributeModels)
    );
  }
  convertToFormInputs(attributeModels: AttributeModel[]): FormInputAttribute[] {
    return attributeModels.map((attributeModel) => {
      const type = this.attributeInputConverter.getInputType(attributeModel);
      const defaultValue = this.attributeInputConverter.getFormDefaultValue(
        type,
        attributeModel.default_value_set,
        attributeModel.default_value
      );
      return {
        name: attributeModel.name,
        defaultValue: defaultValue,
        inputType: type,
        description: attributeModel.description,
        type: attributeModel.type,
        isOptional: attributeModel.type.includes("?"),
      };
    });
  }
  getNotReadonlyAttributes(attributes: AttributeModel[]): AttributeModel[] {
    return attributes.filter((attribute) => attribute.modifier !== "r");
  }
}
