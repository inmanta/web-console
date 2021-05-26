import React, { useState } from "react";
import { KeycloakInstance } from "keycloak-js";
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@patternfly/react-core";
import { ServiceModel } from "@/Core";
import { words } from "@/UI";
import {
  AttributeConverter,
  submitCreate,
  FormAttributeResult,
} from "@/UI/Pages/ServiceInstanceForm";
import { CreateFormPresenter } from "./CreateFormPresenter";

interface Props {
  serviceEntity: ServiceModel;
  handleRedirect: () => void;
  keycloak?: KeycloakInstance;
}

export const CreateFormCard: React.FC<Props> = ({
  serviceEntity,
  handleRedirect,
  keycloak,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const submitCreateInstance = (attributes: FormAttributeResult[]) => {
    submitCreate(
      serviceEntity,
      attributes,
      setErrorMessage,
      handleRedirect,
      keycloak
    );
  };
  const formPresenter = new CreateFormPresenter(new AttributeConverter());

  return (
    <Card>
      <CardHeader>
        {words("inventory.addInstance.title")(serviceEntity.name)}
      </CardHeader>
      <CardBody>
        {formPresenter.presentForm(
          serviceEntity.attributes,
          submitCreateInstance,
          handleRedirect
        )}
      </CardBody>
      <CardFooter>
        <AlertGroup isToast>
          {errorMessage && (
            <Alert
              variant={"danger"}
              title={errorMessage}
              actionClose={
                <AlertActionCloseButton onClose={() => setErrorMessage("")} />
              }
            ></Alert>
          )}
        </AlertGroup>
      </CardFooter>
    </Card>
  );
};
