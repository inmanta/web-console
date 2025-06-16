import React, { useContext, useState } from "react";
import {
  Button,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
} from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { useChangeUserPassword } from "@/Data/Queries";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI";

interface Props {
  user: string;
}

/**
 * A functional component that renders a form for changing a user's password.
 * @props {Props} props - The props of the component.
 * @prop {string} user - The username of the user to change the password for.
 *
 * @returns {React.FC<Props>} The rendered change password form.
 */
export const ChangePasswordForm: React.FC<Props> = ({ user }) => {
  const { closeModal } = useContext(ModalContext);
  const [password, setPassword] = useState("");

  const { mutate, isPending, isError, error } = useChangeUserPassword(user, {
    onSuccess: () => {
      closeModal();
    },
  });

  /** 
   * Handles the submission of the form.
   *
   * This function is responsible for preventing the default form submission behavior and then calling the mutate function with the current password.
   * @param {React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>} event - The event that triggered the form submission. This can be either a form submission event or a button click event.
   *
   * @returns {void}
   */
  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    event.preventDefault();
    mutate({ password });
  };

  return (
    <Form onSubmit={handleSubmit}>
      {isError && error && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              variant={isError ? "error" : "default"}
              icon={<ExclamationTriangleIcon />}
              aria-label="error-message"
            >
              {error.message}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
      <FormGroup label="New Password" isRequired>
        <TextInput
          type="password"
          placeholder={words("userManagement.changePassword.placeholder")}
          value={password}
          onChange={(_event, value) => setPassword(value)}
        />
      </FormGroup>
      <Button variant="primary" type="submit" isLoading={isPending}>
        {words("userManagement.changePassword")}
      </Button>
    </Form>
  );
};
