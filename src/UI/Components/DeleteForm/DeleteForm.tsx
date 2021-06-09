import React from "react";
import { Form, ActionGroup, Button } from "@patternfly/react-core";
import { words } from "@/UI/words";

export const DeleteForm: React.FunctionComponent<{
  onSubmit: () => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  return (
    <React.Fragment>
      <Form>
        <ActionGroup>
          <Button variant="primary" id="submit" onClick={onSubmit}>
            {words("yes")}
          </Button>
          <Button variant="secondary" id="cancel" onClick={onCancel}>
            {words("no")}
          </Button>
        </ActionGroup>
      </Form>
    </React.Fragment>
  );
};
