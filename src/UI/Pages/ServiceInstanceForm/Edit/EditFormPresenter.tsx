import {
  AttributeModel,
  FormAttributeResult,
  InstanceAttributeModel,
} from "@/Core";
import React from "react";
import {
  FormInputAttribute,
  ServiceInstanceForm,
} from "@/UI/Pages/ServiceInstanceForm";
import { AttributeInputConverter, toOptionalBoolean } from "@/UI/Data";

export class EditFormPresenter {
  constructor(
    private readonly attributeInputConverter: AttributeInputConverter
  ) {}

  presentForm(
    currentAttributes: InstanceAttributeModel | null,
    attributeModels: AttributeModel[],
    onSubmit: (attributes: FormAttributeResult[]) => void,
    onCancel: () => void
  ): React.ReactElement {
    const formInputAttributes = this.getFormInputsForEditForm(
      currentAttributes,
      attributeModels
    );

    return (
      <ServiceInstanceForm
        formInputAttributes={formInputAttributes}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }

  getFormInputsForEditForm(
    currentAttributes: InstanceAttributeModel | null,
    attributeModels: AttributeModel[]
  ): FormInputAttribute[] {
    const editableAttributes = this.getEditableAttributes(attributeModels);
    return this.convertToEditFormInputs(currentAttributes, editableAttributes);
  }

  getCurrentAttributeValue(
    currentAttributes: InstanceAttributeModel | null,
    attributeModel: AttributeModel
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  ): string | boolean | null | any {
    if (currentAttributes) {
      if (attributeModel.type.includes("bool")) {
        return toOptionalBoolean(
          currentAttributes[attributeModel.name] as string
        );
      } else if (attributeModel.type.includes("dict")) {
        return JSON.stringify(currentAttributes[attributeModel.name]);
        // Don't set text input to null
      } else if (currentAttributes[attributeModel.name] !== null) {
        return currentAttributes[attributeModel.name];
      }
    }
    return "";
  }

  convertToEditFormInputs(
    currentAttributes: InstanceAttributeModel | null,
    attributeModels: AttributeModel[]
  ): FormInputAttribute[] {
    return attributeModels.map((attributeModel) => {
      const type = this.attributeInputConverter.getInputType(attributeModel);
      const defaultValue = this.getCurrentAttributeValue(
        currentAttributes,
        attributeModel
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

  getEditableAttributes(attributes: AttributeModel[]): AttributeModel[] {
    return attributes.filter((attribute) => attribute.modifier === "rw+");
  }
}
