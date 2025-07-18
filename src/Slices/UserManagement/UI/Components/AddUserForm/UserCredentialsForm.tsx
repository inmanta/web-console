import React, { useContext, useEffect, useState } from "react";
import {
  FormHelperText,
  HelperText,
  HelperTextItem,
  Form,
  FormGroup,
  TextInput,
  InputGroup,
  InputGroupItem,
  Button,
  ActionGroup,
  ValidatedOptions,
  Spinner,
  Flex,
} from "@patternfly/react-core";
import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from "@patternfly/react-icons";
import { useAddUser } from "@/Data/Queries";
import { words } from "@/UI";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";

interface UserCredentialsFormProps {
  submitButtonText: string;
  submitButtonLabel?: string;
}

/**
 * UserCredentialsForm component.
 * @props {UserCredentialsFormProps} props - The component props.
 * @prop {string} submitButtonText - The text to display on the submit button.
 * @prop {string} submitButtonLabel - The aria-label for the submit button.
 *
 * @returns {React.FC<UserCredentialsFormProps>} The rendered component.
 */
export const UserCredentialsForm: React.FC<UserCredentialsFormProps> = ({
  submitButtonText,
  submitButtonLabel = "login-button",
}) => {
  const { mutate, isSuccess, isError, error, isPending } = useAddUser();
  const { closeModal } = useContext(ModalContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);

  /**
   * Handle the change of the username input field.
   * @param {React.FormEvent<HTMLInputElement>} _event - The event object.
   * @param {string} value - The current value of the input field.
   *
   * @returns {void}
   */
  const handleUsernameChange = (_event: React.FormEvent<HTMLInputElement>, value: string): void => {
    setUsername(value);
  };

  /**
   * Handle the change of the password input field.
   * @param {React.FormEvent<HTMLInputElement>} _event The event object.
   * @param {string} value The current value of the input field.
   *
   * @returns {void}
   */
  const handlePasswordChange = (_event: React.FormEvent<HTMLInputElement>, value: string): void => {
    setPassword(value);
  };

  /**
   * Handles the submission of the form.
   *
   * This function is responsible for preventing the default form submission behavior and then calling the mutate function with the current username and password.
   * @param {React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>} event - The event that triggered the form submission. This can be either a form submission event or a button click event.
   *
   * @returns {void}
   */
  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    event.preventDefault();
    mutate({ username, password });
  };

  useEffect(() => {
    if (isSuccess) {
      closeModal();
    }
  }, [isSuccess, closeModal]);

  return (
    <Form className="loginForm" onSubmit={handleSubmit} autoComplete="off">
      {isError && error && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              variant={isError ? "error" : "default"}
              icon={<ExclamationCircleIcon />}
              aria-label="error-message"
            >
              {error.message}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
      <FormGroup label={words("username")} isRequired fieldId="pf-login-username-id">
        <TextInput
          id="pf-login-username-id"
          isRequired
          validated={ValidatedOptions.default}
          type="text"
          name="pf-login-username-id"
          aria-label="input-username"
          value={username}
          onChange={handleUsernameChange}
          autoComplete="off"
        />
      </FormGroup>
      <FormGroup label={words("password")} isRequired fieldId="pf-login-password-id">
        <InputGroup>
          <InputGroupItem isFill>
            <TextInput
              isRequired
              type={isPasswordHidden ? "password" : "text"}
              id="pf-login-password-id"
              name="pf-login-password-id"
              aria-label="input-password"
              validated={ValidatedOptions.default}
              value={password}
              onChange={handlePasswordChange}
              autoComplete="off"
            />
          </InputGroupItem>
          <InputGroupItem>
            <Button
              variant="control"
              onClick={() => setIsPasswordHidden(!isPasswordHidden)}
              aria-label={isPasswordHidden ? "show-password" : "hide-password"}
            >
              {isPasswordHidden ? <EyeIcon /> : <EyeSlashIcon />}
            </Button>
          </InputGroupItem>
        </InputGroup>
      </FormGroup>
      <Flex justifyContent={{ default: "justifyContentFlexEnd" }}>
        <ActionGroup>
          <Button variant="secondary" onClick={closeModal} aria-label="cancel-button">
            {words("cancel")}
          </Button>
          <Button
            aria-label={submitButtonLabel}
            variant="primary"
            type="submit"
            onClick={handleSubmit}
            isDisabled={isPending}
          >
            {isPending ? <Spinner size="md" /> : submitButtonText}
          </Button>
        </ActionGroup>
      </Flex>
    </Form>
  );
};
