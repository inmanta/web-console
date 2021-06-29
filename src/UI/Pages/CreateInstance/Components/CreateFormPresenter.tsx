import { AttributeModel, FormAttributeResult } from "@/Core";
import React from "react";
import { Field, ServiceInstanceForm } from "@/UI/Components";
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
    return (
      <ServiceInstanceForm
        fields={this.getFieldsForCreateForm(attributes)}
        onSubmit={onSubmit}
        onCancel={onRedirect}
      />
    );
  }

  getFieldsForCreateForm(attributeModels: AttributeModel[]): Field[] {
    return this.convertToFields(this.getNotReadonlyAttributes(attributeModels));
  }
  convertToFields(attributeModels: AttributeModel[]): Field[] {
    return attributeModels.map((attributeModel) => {
      const type = this.attributeInputConverter.getInputType(attributeModel);
      const defaultValue = this.attributeInputConverter.getFormDefaultValue(
        type,
        attributeModel.default_value_set,
        attributeModel.default_value
      );
      return {
        kind: "Flat",
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
