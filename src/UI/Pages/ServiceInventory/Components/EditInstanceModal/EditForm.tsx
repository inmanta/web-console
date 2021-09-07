import { Field, InstanceAttributeModel, ServiceModel } from "@/Core";
import {
  FieldCreator,
  ServiceInstanceForm,
  EditModifierHandler,
} from "@/UI/Components";
import React from "react";

interface Props {
  serviceEntity: ServiceModel;
  currentAttributes: InstanceAttributeModel | null;
  onSubmit: (fields: Field[], attributes: InstanceAttributeModel) => void;
  onCancel: () => void;
}

export const EditForm: React.FC<Props> = ({
  serviceEntity,
  currentAttributes,
  onSubmit,
  onCancel,
}) => {
  const fields = new FieldCreator(new EditModifierHandler()).create(
    serviceEntity
  );

  return (
    <ServiceInstanceForm
      fields={fields}
      onSubmit={onSubmit}
      onCancel={onCancel}
      originalAttributes={currentAttributes ? currentAttributes : undefined}
    />
  );
};
