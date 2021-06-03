import React from "react";
import { Card, CardBody, CardHeader } from "@patternfly/react-core";
import { FormAttributeResult, ServiceModel } from "@/Core";
import { words } from "@/UI";
import { CreateFormPresenter } from "./CreateFormPresenter";
import { AttributeInputConverterImpl } from "@/Data";

interface Props {
  serviceEntity: ServiceModel;
  handleRedirect: () => void;
  onSubmit: (attributes: FormAttributeResult[]) => Promise<void>;
}

export const CreateFormCard: React.FC<Props> = ({
  serviceEntity,
  handleRedirect,
  onSubmit,
}) => {
  const formPresenter = new CreateFormPresenter(
    new AttributeInputConverterImpl()
  );

  return (
    <Card>
      <CardHeader>
        {words("inventory.addInstance.title")(serviceEntity.name)}
      </CardHeader>
      <CardBody>
        {formPresenter.presentForm(
          serviceEntity.attributes,
          onSubmit,
          handleRedirect
        )}
      </CardBody>
    </Card>
  );
};
