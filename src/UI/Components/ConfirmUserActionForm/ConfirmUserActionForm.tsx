import React from "react";
import { Form, ActionGroup, Button } from "@patternfly/react-core";
import { words } from "@/UI/words";

export const ConfirmUserActionForm: React.FunctionComponent<{
  onSubmit: () => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const preventDefault = (event: React.FormEvent) => {
    event.preventDefault();
  };
  return (
    <Form onSubmit={preventDefault}>
      <ActionGroup>
        <Button variant="primary" id="submit" onClick={onSubmit}>
          {words("yes")}
        </Button>
        <Button variant="secondary" id="cancel" onClick={onCancel}>
          {words("no")}
        </Button>
      </ActionGroup>
    </Form>
  );
};
