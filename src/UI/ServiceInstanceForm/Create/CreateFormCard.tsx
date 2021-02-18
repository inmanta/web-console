import { ServiceModel } from "@/Core";
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@patternfly/react-core";
import React, { useState } from "react";

import { AttributeConverter } from "../AttributeConverter";
import { CreateFormPresenter } from "./CreateFormPresenter";
import { submitCreate } from "../InstanceBackendRequestHandlers";
import { FormAttributeResult } from "../ServiceInstanceForm";
import { words } from "@/UI";
import { KeycloakInstance } from "keycloak-js";

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
  const [isSuccessful, setIsSuccessful] = useState(false);
  const submitCreateInstance = (attributes: FormAttributeResult[]) => {
    submitCreate(
      serviceEntity,
      attributes,
      setErrorMessage,
      setIsSuccessful,
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
          {isSuccessful && (
            <Alert
              variant={"success"}
              title={words("inventory.addInstance.success")}
              actionClose={
                <AlertActionCloseButton
                  onClose={() => setIsSuccessful(false)}
                />
              }
            />
          )}
        </AlertGroup>
      </CardFooter>
    </Card>
  );
};
