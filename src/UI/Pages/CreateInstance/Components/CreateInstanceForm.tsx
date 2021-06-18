import React from "react";
import { FormAttributeResult, ServiceModel } from "@/Core";
import { AttributeInputConverterImpl } from "@/Data";
import { CreateFormPresenter } from "./CreateFormPresenter";

interface Props {
  serviceEntity: ServiceModel;
  handleRedirect: () => void;
  onSubmit: (attributes: FormAttributeResult[]) => Promise<void>;
}

export const CreateInstanceForm: React.FC<Props> = ({
  serviceEntity,
  handleRedirect,
  onSubmit,
}) => {
  const formPresenter = new CreateFormPresenter(
    new AttributeInputConverterImpl()
  );

  return formPresenter.presentForm(
    serviceEntity.attributes,
    onSubmit,
    handleRedirect
  );
};
