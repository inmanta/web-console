import { AttributeModel, InstanceAttributeModel, Field } from "@/Core";
import React from "react";
import { ServiceInstanceForm } from "@/UI/Components";
import { AttributeInputConverter } from "@/Data";

export class CreateFormPresenter {
  constructor(
    private readonly attributeInputConverter: AttributeInputConverter
  ) {}
  presentForm(
    fields: Field[],
    onSubmit: (fields: Field[], formState: InstanceAttributeModel) => void,
    onRedirect: () => void
  ): React.ReactElement {
    return (
      <ServiceInstanceForm
        fields={fields}
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
