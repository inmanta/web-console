import React from "react";
import { Field, InstanceAttributeModel } from "@/Core";
import { AttributeInputConverterImpl } from "@/Data";
import { CreateFormPresenter } from "./CreateFormPresenter";

interface Props {
  fields: Field[];
  handleRedirect: () => void;
  onSubmit: (
    fields: Field[],
    attributes: InstanceAttributeModel
  ) => Promise<void>;
}

export const CreateInstanceForm: React.FC<Props> = ({
  fields,
  handleRedirect,
  onSubmit,
}) => {
  const formPresenter = new CreateFormPresenter(
    new AttributeInputConverterImpl()
  );

  return formPresenter.presentForm(fields, onSubmit, handleRedirect);
};
