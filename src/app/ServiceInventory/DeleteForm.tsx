import { Form, ActionGroup, Button } from "@patternfly/react-core";
import React from "react";
import { fetchInmantaApi, IRequestParams } from "@app/utils/fetchInmantaApi";

const DeleteForm: React.FunctionComponent<{ requestParams: IRequestParams, closeModal: () => void }> = props => {
  const submitForm = async () => {
    const requestParams: IRequestParams = props.requestParams;
    requestParams.method = "DELETE";
    await fetchInmantaApi(props.requestParams);
    props.closeModal();
  }

  return <React.Fragment>
    <Form>
      <ActionGroup>
        <Button variant="primary" id="submit" onClick={submitForm}>Yes</Button>
        <Button variant="secondary" id="cancel" onClick={props.closeModal}>No</Button>
      </ActionGroup>
    </Form>
  </React.Fragment>
}

export { DeleteForm };