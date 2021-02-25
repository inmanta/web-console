import { Form, ActionGroup, Button } from "@patternfly/react-core";
import React from "react";
import { fetchInmantaApi, IRequestParams } from "@app/utils/fetchInmantaApi";
import { words } from "@/UI";

const DeleteForm: React.FunctionComponent<{
  requestParams: IRequestParams;
  closeModal: () => void;
}> = ({ requestParams, closeModal }) => {
  const submitForm = async () => {
    closeModal();
    await fetchInmantaApi(requestParams);
  };

  return (
    <React.Fragment>
      <Form>
        <ActionGroup>
          <Button variant="primary" id="submit" onClick={submitForm}>
            {words("yes")}
          </Button>
          <Button variant="secondary" id="cancel" onClick={closeModal}>
            {words("no")}
          </Button>
        </ActionGroup>
      </Form>
    </React.Fragment>
  );
};

export { DeleteForm };
